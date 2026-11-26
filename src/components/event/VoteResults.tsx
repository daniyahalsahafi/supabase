import { percentages, type Totals } from '@/lib/platform-rules';
export function VoteResults({totals,names}:{totals:Totals;names:[string,string]}) {
  const p=percentages(totals);
  const winner=totals.total===0?'لا توجد أصوات بعد':totals.clubA===totals.clubB?'تعادل':totals.clubA>totals.clubB?names[0]:names[1];
  return <div className="space-y-5 text-start">
    <div className="flex items-baseline justify-between"><h3 className="text-lg">إجمالي الأصوات</h3><strong className="text-3xl tabular-nums">{totals.total}</strong></div>
    {[{name:names[0],count:totals.clubA,percent:p.a},{name:names[1],count:totals.clubB,percent:p.b}].map((item,i)=><div key={i}>
      <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><strong>{item.name}</strong><span>{item.count} صوت · {item.percent}%</span></div>
      <div role="meter" aria-label={item.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.percent} className="h-3 overflow-hidden rounded-full bg-muted"><div className={i===0?'h-full bg-primary transition-all':'h-full bg-accent transition-all'} style={{width:`${item.percent}%`}} /></div>
    </div>)}
    <p className="text-sm font-semibold">الأكثر تصويتًا: {winner}</p>
  </div>;
}