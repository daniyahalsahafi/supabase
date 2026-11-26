import { useEffect, useState } from "react";
import { countdownParts } from '@/lib/platform-rules';

export function Countdown({ target }: { target: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now === null ? null : countdownParts(target, now);
  if (time?.ended) return <div role="status" className="text-center font-semibold text-primary">حان موعد الفعالية!</div>;
  const parts = [
    { l: "يوم", v: time?.days ?? null },
    { l: "ساعة", v: time?.hours ?? null },
    { l: "دقيقة", v: time?.minutes ?? null },
    { l: "ثانية", v: time?.seconds ?? null },
  ];
  return (
    <div className="flex justify-center gap-2 sm:gap-3" aria-label="العد التنازلي">
      {parts.map((p) => (
        <div key={p.l} className="min-w-16 rounded-xl bg-card px-3 py-3 text-center shadow-card">
          <div className="font-display text-2xl text-primary tabular-nums sm:text-3xl">{p.v === null ? "--" : p.v}</div>
          <div className="text-xs text-brown">{p.l}</div>
        </div>
      ))}
    </div>
  );
}
