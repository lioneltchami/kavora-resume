"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const freePlanFeatures = [
  "Resume builder with live preview",
  "6 color palettes",
  "AI suggestions (limited)",
  "Share with unique URL",
  "PDF download",
  "Kavora branding in footer",
];

const proPlanFeatures = [
  "Everything in Free",
  "Remove Kavora branding from resume",
  "Cover letter generator (unlimited)",
  "ATS score checker",
  "Priority AI suggestions",
  "All future templates included",
];

function CheckIcon({ gold }: { gold?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={gold ? "#b08d57" : "#6b6560"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleGetPro() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/kavora-logo.png"
            alt="Kavora"
            width={24}
            height={21}
            className="opacity-80"
          />
          <span className="text-[0.8rem] font-semibold tracking-[0.03em] text-[#1b1b1b]">
            Kavora
          </span>
        </Link>
        <Link
          href="/create"
          className="text-[0.8rem] font-medium text-[#6b6560] hover:text-[#b08d57] transition-colors"
        >
          Back to Editor
        </Link>
      </header>

      {/* Pricing Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[0.6875rem] font-medium tracking-[0.3em] text-gold uppercase">
            Pricing
          </p>
          <div className="decorative-line mx-auto mt-4 mb-6" />
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy sm:text-5xl">
            One Price. Yours Forever.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
            No subscriptions, no recurring fees. Pay once and unlock every
            premium feature.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
          {/* Free Plan */}
          <div className="flex flex-col rounded-sm border border-border-light bg-white/50 p-8 transition-all duration-300 hover:shadow-lg">
            <p className="text-[0.6875rem] font-medium tracking-[0.25em] text-text-muted uppercase">
              Free
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy">
                $0
              </span>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              Everything you need to get started.
            </p>

            <div className="my-8 h-px bg-border-light" />

            <ul className="flex flex-col gap-3.5">
              {freePlanFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-[#4a4540]"
                >
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <Link
                href="/create"
                className="flex w-full items-center justify-center rounded-sm border border-border bg-white px-5 py-3 text-sm font-medium text-navy transition-all hover:border-navy hover:shadow-sm"
              >
                Start Building
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col rounded-sm border-2 border-gold/40 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gold/60">
            {/* Badge */}
            <div className="absolute -top-3 left-8 rounded-sm bg-gold px-3 py-0.5 text-[0.6875rem] font-semibold tracking-[0.15em] text-white uppercase">
              Recommended
            </div>

            <p className="text-[0.6875rem] font-medium tracking-[0.25em] text-gold uppercase">
              Pro
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy">
                $9
              </span>
              <span className="text-sm text-text-muted">one-time</span>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              Every feature, no branding, forever.
            </p>

            <div className="my-8 h-px bg-border-light" />

            <ul className="flex flex-col gap-3.5">
              {proPlanFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-[#4a4540]"
                >
                  <CheckIcon gold />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <button
                onClick={handleGetPro}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-navy px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-navy-light hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                    Redirecting to checkout...
                  </>
                ) : (
                  "Get Pro"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <div className="mx-auto mt-12 max-w-md text-center">
          <p className="text-xs leading-relaxed text-text-muted/70">
            Secure payment powered by Stripe. No account required.
            <br />
            Your purchase is linked to your resume and activates instantly.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3">
          <Image
            src="/kavora-logo.png"
            alt="Kavora Systems"
            width={24}
            height={21}
            className="opacity-40"
          />
          <p className="text-xs tracking-[0.12em] text-text-muted/50">
            &copy; 2026 Kavora Systems
          </p>
        </div>
      </footer>
    </main>
  );
}
