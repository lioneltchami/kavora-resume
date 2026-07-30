import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-24 text-center">
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <Image
        src="/kavora-logo.png"
        alt="Kavora Systems"
        width={36}
        height={32}
        className="opacity-80"
      />
      <p className="mt-3 text-[0.6875rem] font-medium tracking-[0.3em] uppercase text-gold">
        Resume Builder
      </p>
      <div className="decorative-line mt-5 mb-6" />

      <p className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-text-muted/70">
        404
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
        That link doesn&apos;t lead anywhere. The resume or portfolio may have
        moved, or the URL was mistyped.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
        <Link href="/get-started" className="btn-secondary">
          Get Started
        </Link>
      </div>
    </main>
  );
}
