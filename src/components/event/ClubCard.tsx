import { Shield, GraduationCap } from "lucide-react";
import type { Club } from "@/lib/event-data";
import { positionLabel } from "@/lib/event-data";
import { cn } from "@/lib/utils";

export function ClubLogo({ club, size = "md" }: { club: Pick<Club, "logo_url" | "name">; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-9 w-9" : "h-16 w-16";
  return club.logo_url ? (
    <img src={club.logo_url} alt={`شعار ${club.name}`} className={cn(cls, "rounded-lg object-contain bg-card")} />
  ) : (
    <span className={cn(cls, "grid place-items-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground")} aria-label="شعار النادي (يُضاف لاحقًا)">
      <Shield className={size === "sm" ? "h-4 w-4" : "h-7 w-7"} />
    </span>
  );
}

export function ClubCard({ club }: { club: Club }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-card shadow-card">
      <div className="side-band flex items-center justify-between px-5 py-2 text-xs font-semibold">
        <span>النادي {club.slot}</span>
        <span>الموقف: {positionLabel[club.position]}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <ClubLogo club={club} />
          <div>
            <h3 className="text-xl">{club.name}</h3>
            <p className="flex items-center gap-1 text-sm text-brown"><GraduationCap className="h-4 w-4" />{club.university}</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-muted-foreground">{club.short_description}</p>
        {club.representatives.length > 0 && (
          <div className="mt-auto border-t border-border pt-3">
            <div className="mb-2 text-xs font-semibold text-navy">ممثلو النادي</div>
            <ul className="flex flex-wrap gap-2">
              {club.representatives.map((r, i) => (
                <li key={i} className="flex items-center gap-2 rounded-full bg-sage-soft px-3 py-1 text-xs text-secondary-foreground">
                  {r.photo_url && <img src={r.photo_url} alt="" className="h-5 w-5 rounded-full object-cover" />}
                  <span>{r.name}</span>
                  {r.role && <span className="text-muted-foreground">· {r.role}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
