import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import AuthNav from "@/components/AuthNav";

interface SiteChromeProps {
  children: ReactNode;
  showAuth?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function SiteNav({
  showAuth = true,
  backHref,
  backLabel,
}: Omit<SiteChromeProps, "children">) {
  return (
    <nav className="site-nav" aria-label="Primary">
      <Link href="/" className="site-nav__brand">
        <Image src="/kavora-logo.png" alt="" width={18} height={15} />
        Kavora
      </Link>
      <div className="site-nav__actions">
        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-ink-2 no-underline hover:text-ink"
          >
            {backLabel ?? "Back"}
          </Link>
        )}
        {showAuth ? <AuthNav /> : null}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__mark">Kavora</p>
      <p className="m-0 max-w-md text-sm leading-relaxed text-ink-2">
        Resume and portfolio on one link. Built for people who need to share
        work fast.
      </p>
      <div className="site-footer__meta">
        <span>© 2026 Kavora Systems</span>
        <Link href="/pricing">Pricing</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
    </footer>
  );
}

export default function SiteChrome({
  children,
  showAuth = true,
  backHref,
  backLabel,
}: SiteChromeProps) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <SiteNav showAuth={showAuth} backHref={backHref} backLabel={backLabel} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
