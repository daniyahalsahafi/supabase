import { createServerFn } from '@tanstack/react-start';
import { useSession, setResponseHeader } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { distanceMeters, safeAccountUrl } from './platform-rules';

const phaseInput = z.object({ matchId: z.string().uuid(), phase: z.enum(['pre', 'post']) });
export const getPublicEvent = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('تعذر الاتصال بالمنصة');
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('authorization') === `Bearer ${key}`) headers.delete('authorization');
    headers.set('apikey', key); return fetch(input, { ...init, headers });
  } } });
  const [clubs, matches, settings] = await Promise.all([client.from('clubs').select('*').order('slot'), client.from('matches').select('*').order('match_number'), client.from('event_settings').select('*').eq('id',1).maybeSingle()]);
  if (clubs.error || matches.error || settings.error) throw new Error('تعذر تحميل بيانات الفعالية');
  let logo = settings.data?.organizer_logo_url ?? null;
  if (logo && !logo.startsWith('https://')) {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const signed = await supabaseAdmin.storage.from('club-identity').createSignedUrl(logo, 3600);
    logo = signed.data?.signedUrl ?? null;
  }
  return { clubs: clubs.data ?? [], matches: matches.data ?? [], settings: settings.data ? { ...settings.data, organizer_logo_url: logo } : null };
});
export const getPublicTotals = createServerFn({ method: 'POST' }).inputValidator(phaseInput).handler(async ({ data }) => {
  setResponseHeader('Cache-Control','no-store');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const result = await supabaseAdmin.rpc('match_vote_totals', { p_match:data.matchId, p_phase:data.phase });
  if (result.error) throw new Error('تعذر تحميل النتائج');
  return result.data;
});
export const getAdminData = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role',{ _user_id:context.userId, _role:'admin' });
  if (role.error || !role.data) throw new Error('هذه الصفحة متاحة للمسؤولين فقط');
  setResponseHeader('Cache-Control','no-store');
  const [clubs,matches,settings,controls] = await Promise.all([context.supabase.from('clubs').select('*').order('slot'),context.supabase.from('matches').select('*').is('archived_at',null).order('match_number'),context.supabase.from('event_settings').select('*').eq('id',1).single(),context.supabase.from('voting_controls').select('*')]);
  if (clubs.error || matches.error || settings.error || controls.error) throw new Error('تعذر تحميل لوحة الإدارة');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const totals: Record<string, unknown> = {};
  await Promise.all(matches.data.map(async m => { for (const phase of ['pre','post']) { const r=await supabaseAdmin.rpc('admin_match_vote_totals',{p_match:m.id,p_phase:phase}); if (r.error) throw new Error('تعذر تحميل الإحصائيات'); totals[`${m.id}-${phase}`]=r.data; } }));
  let logoPreview = settings.data.organizer_logo_url;
  if (logoPreview && !logoPreview.startsWith('https://')) { const r=await supabaseAdmin.storage.from('club-identity').createSignedUrl(logoPreview,3600); logoPreview=r.data?.signedUrl??null; }
  return { clubs:clubs.data,matches:matches.data,settings:settings.data,controls:controls.data,totals,logoPreview };
});
const matchFields = z.object({ name:z.string().trim().min(1).max(150),description:z.string().max(2000),details:z.string().max(10000),club_a_id:z.string().uuid().nullable(),club_b_id:z.string().uuid().nullable() });
const actions = z.discriminatedUnion('kind',[
  z.object({kind:z.literal('create'),fields:matchFields}),
  z.object({kind:z.literal('match'),id:z.string().uuid(),fields:matchFields}),
  z.object({kind:z.literal('archive'),id:z.string().uuid()}),
  z.object({kind:z.literal('visible'),id:z.string().uuid(),value:z.boolean()}),
  z.object({kind:z.literal('control'),id:z.string().uuid(),field:z.enum(['pre_open','post_open','pre_results_visible','post_results_visible']),value:z.boolean()}),
  z.object({kind:z.literal('result'),id:z.string().uuid(),score_a:z.number().min(0),score_b:z.number().min(0)}),
  z.object({kind:z.literal('club'),id:z.string().uuid(),name:z.string().min(1),university:z.string(),short_description:z.string(),logo_url:z.string().nullable()}),
  z.object({kind:z.literal('settings'),event_at:z.string().datetime().nullable(),venue:z.string(),account_handle:z.string(),official_account_url:z.string(),organizer_logo_url:z.string().nullable(),attendance_enabled:z.boolean(),venue_latitude:z.number().min(-90).max(90).nullable(),venue_longitude:z.number().min(-180).max(180).nullable(),attendance_radius_m:z.number().int().min(10).max(5000)})
]);
export type AdminAction = z.infer<typeof actions>;
export const adminAction = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(actions).handler(async ({data,context}) => {
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if (role.error || !role.data) throw new Error('لا تملك صلاحية الإدارة');
  const db=context.supabase;
  if (data.kind==='create') {
    if (!data.fields.club_a_id || !data.fields.club_b_id || data.fields.club_a_id===data.fields.club_b_id) throw new Error('اختر ناديين مختلفين');
    const last=await db.from('matches').select('match_number').order('match_number',{ascending:false}).limit(1);
    const r=await db.from('matches').insert({...data.fields,match_number:Math.max(3,last.data?.[0]?.match_number??3)+1,round:'independent',is_visible:false}).select('id').single();
    if(r.error) throw new Error('تعذر إضافة المسابقة؛ حاول مرة أخرى'); return {success:true};
  }
  if(data.kind==='settings') {
    const {kind,...fields}=data; const official_account_url=safeAccountUrl(fields.official_account_url);
    if(fields.attendance_enabled && (fields.venue_latitude===null || fields.venue_longitude===null)) throw new Error('حدد إحداثيات الفعالية أولًا');
    if(fields.organizer_logo_url && !fields.organizer_logo_url.startsWith('https://') && !/^identity\/[\w.-]+$/.test(fields.organizer_logo_url)) throw new Error('مسار شعار غير صالح');
    const date=fields.event_at?new Date(fields.event_at):null;
    const r=await db.from('event_settings').update({...fields,official_account_url,date_label:date?new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',dateStyle:'long'}).format(date):'يُعلن لاحقًا',time_label:date?new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',timeStyle:'short'}).format(date):'يُعلن لاحقًا',updated_at:new Date().toISOString()}).eq('id',1).select('id').single();
    if(r.error) throw new Error('تعذر حفظ إعدادات الفعالية'); return {success:true};
  }
  if(data.kind==='control') {
    const r=await db.from('voting_controls').update({[data.field]:data.value,updated_at:new Date().toISOString()}).eq('match_id',data.id).select('match_id').single();
    if(r.error) throw new Error('تعذر تحديث مرحلة التصويت'); return {success:true};
  }
  if(data.kind==='club') {
    const {kind,id,...fields}=data; const r=await db.from('clubs').update(fields).eq('id',id).select('id').single(); if(r.error)throw new Error('تعذر حفظ النادي'); return {success:true};
  }
  let fields: Database['public']['Tables']['matches']['Update']={};
  if(data.kind==='archive') fields={archived_at:new Date().toISOString(),is_visible:false};
  if(data.kind==='visible')fields={is_visible:data.value};
  if(data.kind==='match') { if(data.fields.club_a_id===data.fields.club_b_id && data.fields.club_a_id)throw new Error('اختر ناديين مختلفين'); fields=data.fields; }
  if(data.kind==='result') {
    if(data.score_a===data.score_b)throw new Error('لا يمكن اعتماد التعادل');
    const m=await db.from('matches').select('club_a_id,club_b_id').eq('id',data.id).single();
    if(m.error || !m.data.club_a_id || !m.data.club_b_id)throw new Error('طرفا المواجهة غير مكتملين');
    fields={score_a:data.score_a,score_b:data.score_b,status:'confirmed',winner_id:data.score_a>data.score_b?m.data.club_a_id:m.data.club_b_id};
  }
  const r=await db.from('matches').update(fields).eq('id',data.id).select('id').single();
  if(r.error) throw new Error(data.kind==='match'?'تعذر الحفظ؛ لا يمكن تغيير خيارات مواجهة لها أصوات أو أطراف البطولة الثابتة':'تعذر حفظ المسابقة');
  return {success:true};
});
export const attendanceCode = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const r=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'}); if(r.error||!r.data)throw new Error('غير مصرح');
  const secret=process.env['VOTING_SESSION_SECRET']; if(!secret)throw new Error('حماية التصويت غير مهيأة');
  const { rotatingCode }=await import('./voting-identity.server');
  setResponseHeader('Cache-Control','no-store'); return {code:await rotatingCode(secret,Math.floor(Date.now()/60000)),expiresAt:(Math.floor(Date.now()/60000)+1)*60000};
});
export const castVote = createServerFn({method:'POST'}).inputValidator(phaseInput.extend({choiceClubId:z.string().uuid(),code:z.string().regex(/^\d{6}$/),latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),accuracy:z.number().min(0).max(100),locatedAt:z.number()})).handler(async ({data})=>{
  setResponseHeader('Cache-Control','no-store');
  const secret=process.env['VOTING_SESSION_SECRET']; if(!secret)throw new Error('التصويت غير مهيأ');
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const s=await supabaseAdmin.from('event_settings').select('attendance_enabled,venue_latitude,venue_longitude,attendance_radius_m').eq('id',1).single();
  if(s.error||!s.data.attendance_enabled||s.data.venue_latitude===null||s.data.venue_longitude===null)throw new Error('لم تُفعّل إعدادات الحضور بعد');
  if(Math.abs(Date.now()-data.locatedAt)>60000 || distanceMeters(data.latitude,data.longitude,s.data.venue_latitude,s.data.venue_longitude)+data.accuracy>s.data.attendance_radius_m)throw new Error('يجب التواجد داخل نطاق الفعالية مع موقع دقيق');
  const {rotatingCode,hashIdentity}=await import('./voting-identity.server');
  const bucket=Math.floor(Date.now()/60000);
  if(data.code!==await rotatingCode(secret,bucket) && data.code!==await rotatingCode(secret,bucket-1))throw new Error('رمز الحضور غير صحيح أو انتهت صلاحيته');
  const session=await useSession<{voterId:string}>({password:secret,name:'event-voter',maxAge:31536000,cookie:{httpOnly:true,secure:true,sameSite:'lax',path:'/'}});
  if(!session.data.voterId)await session.update({voterId:crypto.randomUUID()});
  const id=session.data.voterId; if(!id)throw new Error('تعذر إنشاء هوية التصويت');
  const r=await supabaseAdmin.rpc('accept_match_vote',{p_match:data.matchId,p_phase:data.phase,p_choice:data.choiceClubId,p_voter:await hashIdentity(secret,id)});
  if(r.error)throw new Error(r.error.code==='23505'?'سبق تسجيل صوتك لهذه المسابقة والمرحلة':r.error.code==='P0001'?r.error.message:'تعذر تسجيل الصوت');
  return {success:true};
});