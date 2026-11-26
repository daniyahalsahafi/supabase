import { queryOptions } from "@tanstack/react-query";
import { getPublicEvent } from './platform.functions';

export type Representative = { name: string; role?: string; photo_url?: string };
export type SocialLink = { platform: string; url: string };
export type Club = {
  id: string;
  slot: number;
  name: string;
  short_description: string;
  university: string;
  logo_url: string | null;
  position: "supporting" | "opposing";
  representatives: Representative[];
};
export type MatchStatus = "scheduled" | "live" | "pending" | "confirmed";
export type Match = {
  id: string;
  match_number: number;
  round: "semifinal" | "final" | "independent";
  name: string;
  description: string;
  details: string;
  is_visible: boolean;
  club_a_id: string | null;
  club_b_id: string | null;
  status: MatchStatus;
  winner_id: string | null;
  score_a: number | null;
  score_b: number | null;
  result_notes: string;
  scheduled_at: string | null;
};
export type EventSettings = {
  event_at: string | null;
  date_label: string;
  time_label: string;
  venue: string;
  account_handle: string;
  socials: SocialLink[];
  organizer_logo_url: string | null;
  official_account_url?: string;
};

export const defaultSettings: EventSettings = {
  event_at: null,
  date_label: "يُعلن لاحقًا",
  time_label: "يُعلن لاحقًا",
  venue: "يُعلن لاحقًا",
  account_handle: "@EntrClub_kau",
  socials: [],
  organizer_logo_url: null,
};

export const clubsQuery = queryOptions({
  queryKey: ["clubs"],
  queryFn: async () => {
    return (await getPublicEvent()).clubs as unknown as Club[];
  },
});
export const matchesQuery = queryOptions({
  queryKey: ["matches"],
  queryFn: async () => {
    return (await getPublicEvent()).matches as unknown as Match[];
  },
});
export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  refetchInterval: 30000,
  queryFn: async () => {
    return ((await getPublicEvent()).settings ?? defaultSettings) as unknown as EventSettings;
  },
});

export const statusLabel: Record<MatchStatus, string> = {
  scheduled: "مجدولة",
  live: "جارية الآن",
  pending: "بانتظار الاعتماد",
  confirmed: "نتيجة معتمدة",
};
export const positionLabel = { supporting: "", opposing: "" } as const;
export const roundLabel = (m: Pick<Match, "match_number">) =>
  m.match_number === 3 ? "النهائي" : `نصف النهائي ${m.match_number === 1 ? "الأول" : "الثاني"}`;
