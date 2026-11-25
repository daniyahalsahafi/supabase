import { Instagram, Linkedin, Youtube, Link2, Twitter } from "lucide-react";
import type { SocialLink } from "@/lib/event-data";

const icons: Record<string, typeof Link2> = { x: Twitter, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };
const names: Record<string, string> = { x: "إكس", twitter: "إكس", instagram: "إنستغرام", linkedin: "لينكدإن", youtube: "يوتيوب" };

export function SiteFooter({ handle, socials }: { handle: string; socials: SocialLink[] }) {
  return (
    <footer className="mt-20 border-t-4 border-navy bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div>
          <div className="font-display text-xl">من يملك الريادة؟</div>
          <div className="text-sm opacity-80">الحساب الرسمي: <span dir="ltr" className="text-accent">{handle}</span></div>
        </div>
        <ul className="flex gap-3">
          {socials.filter((s) => s.url).map((s, i) => {
            const Icon = icons[s.platform] ?? Link2;
            return (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={names[s.platform] ?? s.platform}
                  className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/30 transition hover:bg-accent hover:border-accent">
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </footer>
  );
}
