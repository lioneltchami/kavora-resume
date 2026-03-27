"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      {/* Success icon */}
      <div className="animate-fade-in-up flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/30 bg-gold/5">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b08d57"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="animate-fade-in-up animate-delay-1 mt-8 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy sm:text-5xl">
        Payment Successful
      </h1>

      <div className="decorative-line animate-fade-in-up animate-delay-2 mt-6 mb-6" />

      <p className="animate-fade-in-up animate-delay-2 max-w-md text-center text-base leading-relaxed text-text-muted">
        Your Kavora Resume Builder Pro features are now active.
        <br />
        Kavora branding has been removed from your resume.
      </p>

      {/* Actions */}
      <div className="animate-fade-in-up animate-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        {slug && (
          <Link href={`/r/${slug}`} className="btn-primary">
            View Your Resume
            <span className="text-gold-light" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        )}
        <Link href="/create" className="btn-secondary">
          {slug ? "Edit Resume" : "Create a Resume"}
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 flex flex-col items-center gap-3">
        <Image
          src="/kavora-logo.png"
          alt="Kavora Systems"
          width={22}
          height={19}
          className="opacity-40"
        />
        <p className="text-[0.625rem] tracking-[0.12em] text-text-muted/40">
          &copy; 2026 Kavora Systems
        </p>
      </footer>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
