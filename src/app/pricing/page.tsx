"use client";

import Link from "next/link";
import { useState } from "react";
import SiteChrome from "@/components/SiteChrome";
import { SITE_DOMAIN } from "@/lib/site";

const freePlanFeatures = [
  "Resume builder with live preview",
  "6 color palettes & 4 layout templates",
  "Share with unique URL (/r/your-name)",
  "Portfolio website with 3 projects (/p/your-name)",
  "Contact form on your portfolio",
  "PDF download + ATS-Safe PDF",
  "1 job tailor (paste a JD → tailored copy)",
  "3 AI suggestions (then requires Pro)",
  "LinkedIn text import",
  "Kavora branding on shared pages",
];

const proPlanFeatures = [
  "Unlimited portfolio projects (free = 3)",
  "Testimonials on your portfolio",
  "Remove Kavora branding from all pages",
  "Unlimited job targeting",
  "Cover letter generator (AI-powered)",
  "Apply Pack ZIP (resume PDF + letter + share link)",
  "ATS compatibility checker",
  "Unlimited AI suggestions",
  "PDF resume import (AI-powered parsing)",
  "All future templates & features",
];

const faqItems = [
  {
    question: "What's included in the portfolio feature?",
    answer:
      "Your portfolio lives at /p/your-name and shows your bio, projects with images, skills, experience, an optional contact form, and — on Pro — testimonials. Free users get 3 projects; Pro users get unlimited.",
  },
  {
    question: "Is this per-resume or per-user?",
    answer:
      "Per-user. Pay once and all your current and future resumes and portfolios get Pro features.",
  },
  {
    question: "Can I try before I buy?",
    answer:
      "Absolutely. Build resumes and a portfolio — including your contact form — for free. Pro unlocks unlimited projects, testimonials, AI tools, and removes Kavora branding.",
  },
  {
    question: "What if I need a refund?",
    answer: "Email us within 7 days for a full refund, no questions asked.",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleGetPro() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "" }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        code?: string;
        alreadyPro?: boolean;
      };

      if (res.status === 401 || data.code === "AUTH_REQUIRED") {
        window.location.href = "/login?next=%2Fpricing";
        return;
      }

      if (data.alreadyPro) {
        setNotice("You're already on Pro — every premium feature is unlocked.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setNotice(data.error || "Failed to start checkout. Please try again.");
      setLoading(false);
    } catch {
      setNotice("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <SiteChrome backHref="/create" backLabel="← Editor">
      <section className="px-[clamp(1rem,3.5vw,3rem)] py-16 md:py-24">
        <div className="max-w-5xl">
          <h1 className="text-display-s max-w-[16ch] text-ink">
            Resume + portfolio. One price. Forever.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">
            Pay once and unlock every premium feature — including your personal
            portfolio website. No subscriptions, no per-resume fees.
          </p>
          <p className="mt-4 text-sm text-ink-2">
            Portfolio at{" "}
            <span className="font-mono text-xs text-accent">
              {SITE_DOMAIN}/p/your-name
            </span>{" "}
            — free with 3 projects, unlimited with Pro.
          </p>

          {/* Honest proof — real commitments only, no invented metrics */}
          <ul className="mt-10 flex flex-col gap-3 border-t border-rule pt-8 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
            <li className="text-sm text-ink">
              <span className="font-mono text-xs text-accent">$19</span>
              <span className="text-ink-2"> · one-time, no subscription</span>
            </li>
            <li className="text-sm text-ink">
              <span className="font-mono text-xs text-accent">7 days</span>
              <span className="text-ink-2"> · full refund on request</span>
            </li>
            <li className="text-sm text-ink">
              <span className="font-mono text-xs text-accent">Stripe</span>
              <span className="text-ink-2">
                {" "}
                · pay once, unlocks on your account
              </span>
            </li>
            <li className="text-sm">
              <Link
                href="/r/reena"
                className="text-ink underline-offset-2 hover:text-accent hover:underline"
              >
                See a live resume example →
              </Link>
            </li>
          </ul>

          <div className="mt-16 grid gap-0 border-t border-rule md:grid-cols-2">
            {/* Free */}
            <div className="border-b border-rule py-10 pr-0 md:border-b-0 md:border-r md:pr-10">
              <p className="font-mono text-xs text-ink-2">Free</p>
              <p className="mt-3 font-display text-4xl font-semibold text-ink">
                $0
              </p>
              <p className="mt-2 text-sm text-ink-2">
                Everything to get started. No card required.
              </p>
              <ul className="mt-8 space-y-3">
                {freePlanFeatures.map((feature) => (
                  <li key={feature} className="text-sm text-ink-2">
                    — {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/create" className="btn-ghost">
                  Start building
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="py-10 md:pl-10">
              <p className="font-mono text-xs text-accent">Pro · recommended</p>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-ink">
                  $19
                </span>
                <span className="text-sm text-ink-2">one-time</span>
              </p>
              <p className="mt-2 text-sm text-ink-2">
                Every feature, all resumes, forever.
              </p>
              <ul className="mt-8 space-y-3">
                {proPlanFeatures.map((feature) => (
                  <li key={feature} className="text-sm text-ink">
                    — {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                {notice && (
                  <p className="mb-3 border border-rule bg-paper-2 px-4 py-2.5 text-sm text-ink-2">
                    {notice}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleGetPro}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Redirecting…" : "Get Pro"}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-ink-2">
            Secure payment via Stripe. Purchase links to your account and
            activates instantly.
          </p>
        </div>
      </section>

      <section className="border-t border-rule px-[clamp(1rem,3.5vw,3rem)] py-16">
        <div className="max-w-2xl">
          <h2 className="text-display-s text-ink">Questions?</h2>
          <dl className="mt-10 flex flex-col gap-8">
            {faqItems.map((item) => (
              <div key={item.question} className="border-t border-rule pt-6">
                <dt className="text-sm font-semibold text-ink">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </SiteChrome>
  );
}
