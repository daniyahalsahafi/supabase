import { useEffect, useState } from "react";

export function Countdown({ target }: { target: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = target && now ? Math.max(0, new Date(target).getTime() - now) : null;
  const parts = [
    { l: "يوم", v: diff === null ? null : Math.floor(diff / 864e5) },
    { l: "ساعة", v: diff === null ? null : Math.floor(diff / 36e5) % 24 },
    { l: "دقيقة", v: diff === null ? null : Math.floor(diff / 6e4) % 60 },
    { l: "ثانية", v: diff === null ? null : Math.floor(diff / 1e3) % 60 },
  ];
  return (
    <div className="flex justify-center gap-2 sm:gap-3" aria-label="العد التنازلي">
      {parts.map((p) => (
        <div key={p.l} className="geo-frame min-w-16 rounded-xl bg-card px-3 py-3 text-center shadow-card">
          <div className="font-display text-2xl text-primary tabular-nums sm:text-3xl">{p.v === null ? "--" : p.v}</div>
          <div className="text-xs text-brown">{p.l}</div>
        </div>
      ))}
    </div>
  );
}
