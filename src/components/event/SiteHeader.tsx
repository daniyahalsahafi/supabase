import { Link } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import placeholderLogo from "@/assets/organizer-logo-placeholder.svg";

export function SiteHeader({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <header className="relative z-20 border-b border-navy/10 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">

        <nav className="flex items-center gap-5 text-sm font-medium text-primary">
          <a href="#clubs" className="hover:text-brown">الأندية</a>
          <a href="#bracket" className="hover:text-brown">جدول المواجهات</a>
          <a href="#tug" className="hidden hover:text-brown sm:inline">شدّ الحبل</a>
        </nav>

        <Link to="/" aria-label="الجهة المنظمة" className="shrink-0">
          <img
            src={logoUrl || "/club-logo.png"}
            onError={(e) => {
              e.currentTarget.src = placeholderLogo;
            }}
            alt="شعار النادي"
            className="h-12 w-12 object-contain md:h-14 md:w-14"
          />
        </Link>

      </div>
    </header>
  );
}
