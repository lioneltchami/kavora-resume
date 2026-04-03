"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProGateProps {
  feature: string;
  description: string;
  onClose: () => void;
}

export default function ProGate({
  feature,
  description,
  onClose,
}: ProGateProps) {
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      onClose();
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.9)",
          transition:
            "opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="w-full max-w-sm rounded-2xl border border-gold/40 bg-white shadow-2xl"
      >
        {/* Top section */}
        <div
          className="flex flex-col items-center rounded-t-2xl px-6 pb-5 pt-8"
          style={{
            background:
              "linear-gradient(135deg, #faf8f5 0%, #f0ebe4 50%, #f5f0ea 100%)",
          }}
        >
          {/* Gold crown icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <svg
              className="h-8 w-8 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-semibold tracking-tight text-navy font-[family-name:var(--font-cormorant)]">
            Pro Feature
          </h2>

          <p className="text-center text-sm leading-relaxed text-text-muted">
            <span className="font-medium text-navy">{feature}</span>
            {" — "}
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-5">
          <Link
            href="/pricing"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gold-dark active:scale-[0.98]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            Upgrade to Pro — $19
          </Link>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-lg py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-warm hover:text-navy"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
