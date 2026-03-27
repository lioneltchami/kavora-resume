import Image from "next/image";
import Link from "next/link";

function IconPreview() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

const features = [
  {
    icon: <IconPreview />,
    title: "Live Preview",
    description:
      "See your resume take shape in real time. Every edit is reflected instantly, so you stay in flow.",
  },
  {
    icon: <IconShare />,
    title: "Share Anywhere",
    description:
      "Get a unique link to your resume. Share it with recruiters, on LinkedIn, or anywhere you need.",
  },
  {
    icon: <IconDownload />,
    title: "Download PDF",
    description:
      "Export a beautifully typeset PDF, ready to attach to applications and send to hiring managers.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav bar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 28px",
          background: "rgba(250, 248, 245, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/kavora-logo.png" alt="" width={22} height={19} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#1e2a3a",
              letterSpacing: "0.03em",
            }}
          >
            Kavora
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="/pricing"
            style={{
              fontSize: "0.75rem",
              color: "#6b6560",
              textDecoration: "none",
            }}
          >
            Pricing
          </a>
          <a
            href="/login"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "#b08d57",
              textDecoration: "none",
              padding: "6px 14px",
              border: "1px solid #b08d57",
              borderRadius: 2,
            }}
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
        {/* Subtle top decorative border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Label */}
          <div className="animate-fade-in-up flex items-center gap-3">
            <Image
              src="/kavora-logo.png"
              alt="Kavora Systems"
              width={32}
              height={28}
              className="opacity-80"
            />
            <p className="text-[0.6875rem] font-medium tracking-[0.3em] text-gold uppercase">
              By Kavora Systems
            </p>
          </div>

          {/* Decorative line */}
          <div className="decorative-line animate-fade-in-up animate-delay-1 mt-6 mb-8" />

          {/* Heading */}
          <h1 className="animate-fade-in-up animate-delay-2 font-[family-name:var(--font-cormorant)] text-5xl leading-[1.15] font-semibold tracking-[-0.01em] text-navy sm:text-6xl md:text-7xl">
            Build Your
            <br />
            Professional Resume
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in-up animate-delay-3 mt-7 max-w-lg text-base leading-relaxed text-text-muted sm:text-lg">
            Create a polished, ATS-optimized resume in minutes.
            <br className="hidden sm:block" />
            Share it with a unique link or download as PDF.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animate-delay-4 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/create" className="btn-primary">
              Create Your Resume
              <span className="text-gold-light" aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <Link href="/r/reena" className="btn-secondary">
              See Example
            </Link>
            <Link href="/my-resumes" className="btn-secondary">
              My Resumes
            </Link>
          </div>

          {/* Pricing link */}
          <div className="animate-fade-in animate-delay-5 mt-6">
            <Link
              href="/pricing"
              className="text-[0.8rem] font-medium tracking-[0.04em] text-text-muted/60 transition-colors hover:text-gold"
            >
              View Pricing &mdash; Pro from $9
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="animate-fade-in animate-delay-5 absolute bottom-10 flex flex-col items-center gap-2">
          <span className="text-[0.625rem] tracking-[0.25em] text-text-muted/50 uppercase">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-text-muted/30 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border-light px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="text-[0.6875rem] font-medium tracking-[0.3em] text-gold uppercase">
              Everything You Need
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-navy sm:text-4xl">
              Simple by Design
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-navy">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
          <Image
            src="/kavora-logo.png"
            alt="Kavora Systems"
            width={28}
            height={24}
            className="opacity-50"
          />
          <p className="text-xs tracking-[0.15em] text-text-muted/60">
            &copy; 2026 Kavora Systems
          </p>
        </div>
      </footer>
    </main>
  );
}
