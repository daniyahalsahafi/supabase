import type { Match } from "@/lib/event-data";

/** Winner only counts once the result is officially confirmed. */
export function officialWinner(m: Match): string | null {
  return m.status === "confirmed" ? m.winner_id : null;
}

export function officialLoser(m: Match): string | null {
  const w = officialWinner(m);
  if (!w) return null;
  return m.club_a_id === w ? m.club_b_id : m.club_b_id === w ? m.club_a_id : null;
}

export function champion(matches: Match[]): string | null {
  const final = matches.find((m) => m.match_number === 3);
  return final ? officialWinner(final) : null;
}
