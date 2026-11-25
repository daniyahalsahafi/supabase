import { Crown, Trophy } from "lucide-react";
import type { Club, Match } from "@/lib/event-data";
import { roundLabel, statusLabel } from "@/lib/event-data";
import { champion, officialLoser, officialWinner } from "@/lib/bracket";
import { ClubLogo } from "./ClubCard";
import { cn } from "@/lib/utils";

function fmt(d: string | null) {
  if (!d) return "الموعد يُعلن لاحقًا";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}

function Slot({ club, score, state, placeholder }: { club: Club | undefined; score: number | null; state: "won" | "lost" | "none"; placeholder: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border px-3 py-2",
      state === "won" ? "border-sage bg-sage-soft" : "border-border bg-card",
      state === "lost" && "opacity-50")}>
      {club ? <ClubLogo club={club} size="sm" /> : <span className="h-9 w-9 rounded-lg border border-dashed border-border" />}
      <div className="flex-1">
        <div className={cn("font-semibold", club ? "text-primary" : "text-muted-foreground")}>{club?.name ?? placeholder}</div>
        {club && (
          <div className={cn("text-xs", club.position === "supporting" ? "text-navy" : "text-accent")}>
            {club.position === "supporting" ? "مؤيد" : "معارض"}
            {state === "lost" && " · خرج من البطولة"}
            {state === "won" && " · فائز"}
          </div>
        )}
      </div>
      {score !== null && <span className="font-display text-lg tabular-nums text-primary">{score}</span>}
    </div>
  );
}

function MatchCard({ m, clubs, placeholders, highlight }: { m: Match; clubs: Club[]; placeholders: [string, string]; highlight?: boolean }) {
  const a = clubs.find((c) => c.id === m.club_a_id);
  const b = clubs.find((c) => c.id === m.club_b_id);
  const w = officialWinner(m);
  const l = officialLoser(m);
  const st = (id: string | null) => (id && id === w ? "won" : id && id === l ? "lost" : "none") as "won" | "lost" | "none";
  return (
    <div className={cn("geo-frame rounded-xl bg-card p-4 shadow-card", highlight && "ring-2 ring-accent/40")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="font-display text-primary">{roundLabel(m)}</h4>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs",
          m.status === "confirmed" ? "bg-sage-soft text-secondary-foreground" : m.status === "live" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
          {statusLabel[m.status]}
        </span>
      </div>
      <div className="space-y-2">
        <Slot club={a} score={m.score_a} state={st(m.club_a_id)} placeholder={placeholders[0]} />
        <div className="text-center text-xs font-bold text-accent">ضد</div>
        <Slot club={b} score={m.score_b} state={st(m.club_b_id)} placeholder={placeholders[1]} />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{fmt(m.scheduled_at)}</div>
      {m.result_notes && <p className="mt-1 text-xs text-brown">{m.result_notes}</p>}
    </div>
  );
}

export function Bracket({ clubs, matches }: { clubs: Club[]; matches: Match[] }) {
  const [sf1, sf2, final] = [1, 2, 3].map((n) => matches.find((m) => m.match_number === n));
  const champ = clubs.find((c) => c.id === champion(matches));
  return (
    <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
      <div className="space-y-6">
        {sf1 && <MatchCard m={sf1} clubs={clubs} placeholders={["النادي الأول", "النادي الثاني"]} />}
        {sf2 && <MatchCard m={sf2} clubs={clubs} placeholders={["النادي الثالث", "النادي الرابع"]} />}
      </div>
      <div className="hidden h-full w-10 flex-col justify-center lg:flex" aria-hidden>
        <div className="h-1/2 rounded-l-xl border-y-2 border-l-2 border-sage" />
      </div>
      <div className="space-y-4">
        {final && <MatchCard m={final} clubs={clubs} highlight placeholders={["الفائز من نصف النهائي الأول", "الفائز من نصف النهائي الثاني"]} />}
        <div className="geo-frame flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
          {champ ? <Crown className="h-7 w-7 text-accent" /> : <Trophy className="h-7 w-7 text-accent" />}
          <div>
            <div className="text-xs opacity-80">بطل المناظرة</div>
            <div className="font-display text-lg">{champ ? champ.name : "يُتوَّج بعد اعتماد نتيجة النهائي"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
