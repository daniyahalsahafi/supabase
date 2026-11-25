import type { LucideIcon } from "lucide-react";

export function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="geo-frame flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-sage-soft text-navy">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <div className="text-sm text-brown">{label}</div>
        <div className="font-display text-lg text-primary">{value}</div>
      </div>
    </div>
  );
}
