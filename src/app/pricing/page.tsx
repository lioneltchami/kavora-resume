"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const freePlanFeatures = [
  "Resume builder with live preview",
  "6 color palettes & 4 layout templates",
  "Share with unique URL (/r/your-name)",
  "Portfolio website with 3 projects (/p/your-name)",
  "PDF download + ATS-Safe PDF",
  "3 AI suggestions (then requires Pro)",
  "LinkedIn text import",
  "Kavora branding on shared pages",
];

const proPlanFeatures = [
  "Personal portfolio website (/p/your-name)",
  "Unlimited portfolio projects (free = 3)",
  "Contact form + testimonials on portfolio",
  "Remove Kavora branding from all pages",
  "Cover letter generator (AI-powered)",
  "ATS compatibility checker + ATS-Safe PDF",
  "Unlimited AI suggestions",
  "PDF resume import (AI-powered parsing)",
  "All future templates & features",
];

const faqItems = [
  {
    question: "What's included in the portfolio feature?",
    answer:
      "Your portfolio lives at /p/your-name and shows your bio, projects with images, skills, experience, and optionally testimonials and a contact form. Free users get 3 projects; Pro users get unlimited.",
  },
  {
    question: "Is this per-resume or per-user?",
    answer:
      "Per-user. Pay once and all your current and future resumes and portfolios get Pro features.",
  },
  {
    question: "Can I try before I buy?",
    answer:
      "Absolutely. Build resumes and a basic portfolio for free. Pro just unlocks unlimited projects, testimonials, contact form, and removes Kavora branding.",
  },
  {
    question: "What if I need a refund?",
    answer: "Email us within 7 days for a full refund, no questions asked.",
  },
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
            Resume + Portfolio. One Price. Forever.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
            Pay once and unlock every premium feature — including your personal
            portfolio website. No subscriptions, no per-resume fees.
          </p>
        </div>

        {/* Portfolio feature highlight */}
        <div className="mx-auto mt-10 max-w-2xl rounded-sm border border-gold/30 bg-gold/5 px-6 py-4 text-center">
          <p className="text-sm text-[#4a4540]">
            <span className="font-semibold text-navy">New:</span> Every account
            now gets a personal portfolio website at{" "}
            <span className="font-mono text-[0.8rem] text-gold">
              kavora.app/p/your-name
            </span>{" "}
            &mdash; free with 3 projects, unlimited with Pro.
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
              Everything you need to get started. No credit card required.
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
                $19
              </span>
              <span className="text-sm text-text-muted">one-time</span>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              Every feature, all resumes, forever.
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
            Your purchase is linked to your account and activates instantly.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border-light px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-navy sm:text-3xl">
            Questions?
          </h2>
          <div className="decorative-line mx-auto mt-4 mb-10" />

          <dl className="flex flex-col gap-8">
            {faqItems.map((item) => (
              <div key={item.question}>
                <dt className="text-sm font-semibold text-navy">
                  {item.question}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
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
