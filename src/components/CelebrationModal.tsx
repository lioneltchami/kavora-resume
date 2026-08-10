"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ShareKit from "@/components/ShareKit";

interface CelebrationModalProps {
  url: string;
  name: string;
  onClose: () => void;
  /** Set when the user picked "Resume + Portfolio" so step two stays visible. */
  emphasizePortfolio?: boolean;
}

export default function CelebrationModal({
  url,
  name,
  onClose,
  emphasizePortfolio = false,
}: CelebrationModalProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const firstName = name.split(" ")[0] || "there";
  const portfolioSlug = url.split("/r/")[1] ?? "your-name";

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      onClose();
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 transition-opacity duration-200 sm:items-center ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-lg border border-rule bg-paper transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        role="dialog"
        aria-labelledby="celebration-title"
      >
        <div className="border-b border-rule bg-paper-2 px-6 py-8 text-left">
          <p className="font-mono text-xs text-accent">Published</p>
          <h2
            id="celebration-title"
            className="mt-3 font-display text-2xl font-semibold text-ink"
          >
            Your resume is live
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-2">
            Congratulations, {firstName}. Your professional resume is published
            and ready to share.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="border border-rule bg-paper-2 px-4 py-3">
            <p className="truncate font-mono text-sm text-ink">{url}</p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-primary flex-1"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex-1"
            >
              View resume
            </a>
          </div>

          {emphasizePortfolio ? (
            <div className="mt-5 border border-rule bg-paper-2 p-4">
              <p className="font-mono text-xs text-accent">Step 2 of 2</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Add projects and bio to publish the matching portfolio at{" "}
                <span className="font-medium text-ink">/p/{portfolioSlug}</span>
                .
              </p>
              <Link
                href="/create/portfolio"
                className="btn-primary mt-4 inline-flex w-full"
              >
                Set up portfolio →
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm text-ink-2">
              <Link
                href="/create/portfolio"
                className="text-ink underline-offset-2 hover:text-accent hover:underline"
              >
                Add a portfolio at /p/{portfolioSlug} →
              </Link>
            </p>
          )}

          <div className="mt-6 border-t border-rule pt-5">
            <p className="mb-3 font-mono text-xs text-ink-2">Share</p>
            <ShareKit url={url} name={name} compact />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
