export type Phase = 'pre' | 'post';
export type Totals = { clubA: number; clubB: number; total: number };
export function countdownParts(target: string | null, now: number) {
  const timestamp = target ? Date.parse(target) : NaN;
  if (!Number.isFinite(timestamp)) return null;
  const diff = Math.max(0, timestamp - now);
  return { ended: diff === 0, days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 };
}
export function riyadhToIso(value: string) {
  const date = new Date(`${value}:00+03:00`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !Number.isFinite(date.getTime())) throw new Error('موعد غير صالح');
  return date.toISOString();
}
export function isoToRiyadh(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  return new Date(Date.parse(value) + 10800000).toISOString().slice(0, 16);
}
export function safeAccountUrl(value: string) {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('أدخل رابطًا صحيحًا يبدأ بـ https://');
  return url.href;
}
export function distanceMeters(a: number, b: number, c: number, d: number) {
  const radians = Math.PI / 180;
  const h = Math.sin((c-a)*radians/2)**2 + Math.cos(a*radians)*Math.cos(c*radians)*Math.sin((d-b)*radians/2)**2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}
export function phaseOpen(control: { pre_open: boolean; post_open: boolean }, phase: Phase) {
  return phase === 'pre' ? control.pre_open : control.post_open;
}
export function phaseVisible(control: { pre_results_visible: boolean; post_results_visible: boolean }, phase: Phase) {
  return phase === 'pre' ? control.pre_results_visible : control.post_results_visible;
}
export function percentages(totals: Totals) {
  return { a: totals.total ? Math.round(totals.clubA / totals.total * 1000) / 10 : 0, b: totals.total ? Math.round(totals.clubB / totals.total * 1000) / 10 : 0 };
}
export type Difficulty = 'easy' | 'medium' | 'hard';
export const opponent = { easy: { strength: 9, delay: 300 }, medium: { strength: 15, delay: 650 / 3 }, hard: { strength: 21, delay: 470 } } as const;
export function computerPull(level: Difficulty, random: number) { return opponent[level].strength * (0.65 + random * 0.7); }
export function pullPosition(position: number, force: number) { return Math.max(-100, Math.min(100, position + force)); }
