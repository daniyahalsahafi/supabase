import { NetworkMesh } from "@/components/event/NetworkMesh";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { clubsQuery, matchesQuery, settingsQuery } from "@/lib/event-data";
import { SiteHeader } from "@/components/event/SiteHeader";
import { SiteFooter } from "@/components/event/SiteFooter";
import { PodiumArt } from "@/components/event/PodiumArt";
import { Countdown } from "@/components/event/Countdown";
import { InfoCard } from "@/components/event/InfoCard";
import { ClubCard } from "@/components/event/ClubCard";
import { Bracket } from "@/components/event/Bracket";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "من يملك الريادة؟ | مناظرة الأندية الطلابية" },
      {
        name: "description",
        content:
          "بطولة مناظرات بين أربعة أندية طلابية حول ريادة الأعمال: نصفا نهائي ونهائي واحد.",
      },
      {
        property: "og:title",
        content: "من يملك الريادة؟ | مناظرة الأندية الطلابية",
      },
      {
        property: "og:description",
        content: "أربعة أندية، ثلاث مواجهات، وبطل واحد للمناظرة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(clubsQuery),
      context.queryClient.ensureQueryData(matchesQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]),
  component: Index,
});

function SectionTitle({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-8 text-center">
      <div className="text-sm font-semibold text-accent">{kicker}</div>
      <h2 className="mt-1 text-3xl md:text-4xl">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-sage" />
    </div>
  );
}

function Index() {
  const { data: clubs } = useSuspenseQuery(clubsQuery);
  const { data: matches } = useSuspenseQuery(matchesQuery);
  const { data: s } = useSuspenseQuery(settingsQuery);

  const support = clubs.filter((c) => c.position === "supporting");
  const oppose = clubs.filter((c) => c.position === "opposing");

  return (
    <div className="bg-geo min-h-screen">
      <NetworkMesh />
      <SiteHeader logoUrl={s.organizer_logo_url} />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-block rounded-full border border-sage bg-sage-soft px-4 py-1 text-sm text-secondary-foreground">
            مناظرة نادي ريادة الأعمال
          </span>

          <h1 className="mt-5 text-5xl leading-tight md:text-7xl">
            من يملك <span className="text-accent">الريادة؟</span>
          </h1>

          <p className="mt-4 max-w-md text-lg leading-8 text-brown">
            أربعة أندية طلابية تتواجه على المنصة في بطولة خروج المغلوب: نصفا
            نهائي، ونهائي يتوَّج فيه بطل المناظرة.
          </p>

          <div className="mt-8">
            <Countdown target={s.event_at} />
          </div>
        </div>

        <div className="relative">
          <PodiumArt />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        <InfoCard icon={CalendarDays} label="التاريخ" value={s.date_label} />
        <InfoCard icon={Clock} label="الوقت" value={s.time_label} />
        <InfoCard icon={MapPin} label="المكان" value={s.venue} />
      </section>

      <section
        id="clubs"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20"
      >
        <SectionTitle
          kicker="الأندية المتنافسة"
          title="أربعة أندية، في مواجهات مثيرة!"
        />

        <div className="grid items-start gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-6">
            <div className="text-center font-display text-navy">
              الطرف المؤيد
            </div>
            {support.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </div>

          <div className="flex justify-center md:pt-40">
            <span className="animate-vs grid h-20 w-20 place-items-center rounded-full border-4 border-sage bg-primary font-display text-2xl text-accent shadow-card">
              VS
            </span>
          </div>

          <div className="space-y-6">
            <div className="text-center font-display text-navy">
              الطرف المعارض
            </div>
            {oppose.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="bracket"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20"
      >
        <SectionTitle
          kicker="بطولة خروج المغلوب"
          title="جدول المواجهات"
        />

        <Bracket clubs={clubs} matches={matches} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          يتأهل الفائز في كل نصف نهائي إلى النهائي بعد اعتماد النتيجة رسميًا من
          لجنة التحكيم.
        </p>
      </section>

      <section
        id="tug"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20"
      >
        <div className="geo-frame flex flex-col items-center gap-4 rounded-xl bg-card p-8 text-center shadow-card md:flex-row md:text-start">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Users className="h-7 w-7" />
          </span>

          <div>
            <div className="text-sm text-brown">أنت ولا الكمبيوتر؟</div>
            <h3 className="text-2xl">لعبة شدّ الحبل الفردية</h3>
            <p className="mt-1 text-muted-foreground">
              لا تشد أعصابك، العب وخلك رايق للمناظرة!
            </p>
          </div>
        </div>
      </section>

      <SiteFooter handle={s.account_handle} socials={s.socials} />
    </div>
  );
}
