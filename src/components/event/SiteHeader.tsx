import { Link } from "@tanstack/react-router";
import placeholderLogo from "@/assets/organizer-logo-placeholder.svg";

export function SiteHeader({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <header className="relative z-20 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:flex-row">
        <nav className="flex items-center gap-5 text-sm font-medium text-primary">
          <a href="#clubs" className="hover:text-accent">الأندية</a>
          <a href="#bracket" className="hover:text-accent">جدول المواجهات</a>
          <a href="#tug" className="hidden hover:text-accent sm:inline">شدّ الحبل</a>
        </nav>
        {/* Organizer logo: upper-left on desktop (end side in RTL) */}
        <Link to="/" aria-label="الجهة المنظمة" className="shrink-0">
          <img src={logoUrl || placeholderLogo} alt="شعار الجهة المنظمة" className="h-10 w-auto md:h-12" />
        </Link>
      </div>
    </header>
  );
}
