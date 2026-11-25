import { Instagram, Linkedin, Youtube, Link2, Twitter } from "lucide-react";
import type { SocialLink } from "@/lib/event-data";

const icons: Record<string, typeof Link2> = { x: Twitter, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };
const names: Record<string, string> = { x: "إكس", twitter: "إكس", instagram: "إنستغرام", linkedin: "لينكدإن", youtube: "يوتيوب" };

export function SiteFooter({ handle, socials }: { handle: string; socials: SocialLink[] }) {
  const links = socials.filter((s) => s.url);

  return (
    <footer className="mt-20 border-t-4 border-accent bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Right side (start in RTL): event title */}
          <div className="font-display text-xl">من يملك الريادة؟</div>

          {/* Left side (end in RTL): account text, then the social icons at the far edge */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="text-center sm:text-end">
              <div className="text-sm">
                @EntrClub_kau
              </div>
            </div>

            <ul className="flex gap-3">
              {links.map((s, i) => {
                const Icon = icons[s.platform] ?? Link2;
                return (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={names[s.platform] ?? s.platform}
                      className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-navy transition hover:bg-accent hover:text-accent-foreground"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Centered along the bottom edge of the footer */}
        <div className="text-center text-sm opacity-80">نادي ريادة الأعمال – جامعة الملك عبدالعزيز</div>
      </div>
    </footer>
  );
}
