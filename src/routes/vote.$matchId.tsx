import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { VoteResults } from '@/components/event/VoteResults';
import { getPublicEvent, getVotingState, castVote } from '@/lib/platform.functions';
import { phaseOpen, type Phase, type Totals } from '@/lib/platform-rules';

const votingQuery = (matchId: string, phase: Phase) => queryOptions({
  queryKey: ['controls', matchId, phase],
  queryFn: () => getVotingState({ data: { matchId, phase } }),
  refetchInterval: 5000,
});

export const Route = createFileRoute('/vote/$matchId')({
  head: () => ({ meta: [
    { title: 'تصويت الجمهور | روّاد المناظرة' },
    { name: 'description', content: 'التصويت القبلي والبعدي لمواجهات روّاد المناظرة ونتائج الجمهور.' },
    { property: 'og:title', content: 'تصويت الجمهور | روّاد المناظرة' },
    { property: 'og:description', content: 'التصويت القبلي والبعدي لمواجهات روّاد المناظرة ونتائج الجمهور.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  loader: async ({ params, context }) => {
    const event = await getPublicEvent();
    const match = event.matches.find(m => m.id === params.matchId);
    if (!match) return { match: null, clubs: [] };
    await context.queryClient.ensureQueryData(votingQuery(params.matchId, 'pre'));
    return { match, clubs: event.clubs.filter(c => c.id === match.club_a_id || c.id === match.club_b_id) };
  },
  component: VotingPage,
});

function VotingPage() {
  const { matchId } = Route.useParams();
  const { match, clubs } = Route.useLoaderData();
  const [phase, setPhase] = useState<Phase>('pre');
  const [selectedClub, setSelectedClub] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const cache = useQueryClient();
  const submit = useServerFn(castVote);
  const state = useQuery({ ...votingQuery(matchId, phase), enabled: Boolean(match) });
  const isOpen = state.data ? phaseOpen(state.data.controls, phase) : false;
  const voted = state.data?.voted ?? false;
  const totals = state.data?.totals as Totals | null | undefined;

  async function submitVote() {
    if (!selectedClub || sending || !isOpen || voted) return;
    setSending(true); setMessage('');
    try {
      await submit({ data: { matchId, phase, choiceClubId: selectedClub } });
      setMessage('تم تسجيل صوتك بنجاح! شكرًا لمشاركتك');
      await cache.invalidateQueries({ queryKey: ['controls', matchId, phase] });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تسجيل التصويت.');
      await cache.invalidateQueries({ queryKey: ['controls', matchId, phase] });
    } finally { setSending(false); }
  }

  if (!match) return <main dir="rtl" className="p-10 text-center">المواجهة غير موجودة.</main>;

  return <main dir="rtl" className="min-h-screen bg-background px-5 py-12 text-foreground">
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-sm font-semibold text-brown">نادي ريادة الأعمال – جامعة الملك عبدالعزيز</p>
      <h1 className="mb-3 text-4xl font-bold text-primary">روّاد المناظرة</h1>
      <p className="mb-8 text-muted-foreground">صوتك يساهم في قياس آراء الجمهور</p>
      <div className="mb-8 rounded-lg bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">{match.name || `المواجهة ${match.match_number}`}</h2>
        <div className="grid grid-cols-2 gap-4">
          {clubs.map(club => <Button key={club.id} variant="outline" disabled={!isOpen || voted || sending}
            aria-pressed={selectedClub === club.id} onClick={() => setSelectedClub(club.id)}
            className={`h-auto min-h-36 flex-col whitespace-normal rounded-lg border-2 p-5 ${selectedClub === club.id ? 'border-accent bg-gold-soft' : 'border-border bg-card'}`}>
            {club.logo_url && <img src={club.logo_url} alt="" className="mx-auto mb-3 h-16 w-16 object-contain" />}
            <span className="font-bold">{club.name}</span>
            {selectedClub === club.id && <span className="mt-2 text-sm text-brown">تم الاختيار ✓</span>}
          </Button>)}
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3" role="tablist" aria-label="مرحلة التصويت">
        {(['pre', 'post'] as const).map(value => <Button key={value} role="tab" aria-selected={phase === value}
          disabled={sending} onClick={() => { setPhase(value); setSelectedClub(''); setMessage(''); }}
          variant={phase === value ? 'default' : 'outline'} className="h-auto whitespace-normal p-4 font-bold">
          {value === 'pre' ? 'التصويت القبلي' : 'التصويت البعدي'}
        </Button>)}
      </div>
      <div className="rounded-lg bg-card p-6 shadow-sm">
        {state.isPending ? <p>جارٍ التحميل...</p> : state.isError ? <p role="alert">تعذر تحميل حالة التصويت.</p> : <>
          <div className="mb-5"><span className="rounded-full bg-muted px-4 py-2 text-sm font-bold">{isOpen ? 'التصويت مفتوح' : 'التصويت مغلق'}</span></div>
          {voted ? <p className="font-semibold text-primary">سبق تسجيل صوتك في هذه المرحلة.</p> : !isOpen ? <p className="text-muted-foreground">التصويت غير متاح حاليًا.</p> : <>
            <p className="mb-5 text-muted-foreground">اختاري النادي الذي ترغبين بالتصويت له.</p>
            <Button onClick={submitVote} disabled={!selectedClub || sending || clubs.length !== 2} className="h-auto w-full whitespace-normal bg-accent px-6 py-4 font-bold text-accent-foreground">
              {sending ? 'جاري تسجيل صوتك...' : 'إرسال التصويت'}
            </Button>
          </>}
          {message && <p role="status" className="mt-5 font-semibold text-primary">{message}</p>}
          {totals && <div className="mt-6 rounded-lg bg-gold-soft p-4"><VoteResults totals={totals} names={[clubs.find(c => c.id === match.club_a_id)?.name ?? '', clubs.find(c => c.id === match.club_b_id)?.name ?? '']} /></div>}
        </>}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">شكرًا لمشاركتكم في روّاد المناظرة!</p>
      <Button asChild variant="link" className="mt-4"><Link to="/">العودة للرئيسية</Link></Button>
    </div>
  </main>;
}
