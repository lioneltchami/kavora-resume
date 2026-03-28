"use client";

import { useEffect, useRef, useState } from "react";

interface CelebrationModalProps {
  url: string;
  name: string;
  onClose: () => void;
}

export default function CelebrationModal({
  url,
  name,
  onClose,
}: CelebrationModalProps) {
  const [visible, setVisible] = useState(false);
  const [checkVisible, setCheckVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const firstName = name.split(" ")[0] || "there";

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });
    const checkTimer = setTimeout(() => setCheckVisible(true), 350);
    return () => clearTimeout(checkTimer);
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

  const shareText = encodeURIComponent(
    `Check out my professional resume, built with Kavora Resume Builder!`,
  );
  const shareUrl = encodeURIComponent(url);

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  const whatsAppUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0)",
        transition: "background-color 0.4s ease",
      }}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition:
            "opacity 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        {/* Top section with gradient background */}
        <div
          className="flex flex-col items-center rounded-t-2xl px-6 pb-6 pt-8"
          style={{
            background:
              "linear-gradient(135deg, #faf8f5 0%, #f0ebe4 50%, #f5f0ea 100%)",
          }}
        >
          {/* Animated checkmark circle */}
          <div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{
              opacity: checkVisible ? 1 : 0,
              transform: checkVisible ? "scale(1)" : "scale(0.3)",
              transition:
                "opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              background: "linear-gradient(135deg, #1e2a3a 0%, #2d5a3d 100%)",
            }}
          >
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: checkVisible ? 0 : 30,
                transition: "stroke-dashoffset 0.6s ease 0.2s",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2
            className="mb-2 text-2xl font-semibold tracking-tight text-[#1b1b1b]"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.75rem",
            }}
          >
            Your Resume is Live!
          </h2>

          {/* Personal message */}
          <p className="text-center text-sm leading-relaxed text-[#6b6560]">
            Congratulations, {firstName}! Your professional resume is now
            published and ready to share.
          </p>
        </div>

        {/* Content section */}
        <div className="px-6 pb-6 pt-5">
          {/* URL display */}
          <div className="mb-5 rounded-lg border border-[#e8e2da] bg-[#faf8f5] px-4 py-3">
            <p
              className="truncate text-sm text-[#4a4540]"
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
              }}
            >
              {url}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mb-5 flex gap-3">
            <button
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1e2a3a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2d3f54] active:scale-[0.98]"
            >
              {copied ? (
                <>
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
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
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
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#1e2a3a] px-4 py-2.5 text-sm font-medium text-[#1e2a3a] transition-all hover:bg-[#f5f0ea] active:scale-[0.98]"
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
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              View Resume
            </a>
          </div>

          {/* Share links */}
          <div className="mb-5">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-[#9a9590]">
              Share on
            </p>
            <div className="flex items-center justify-center gap-3">
              {/* LinkedIn */}
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e2da] bg-white text-[#6b6560] transition-all hover:border-[#0077B5] hover:text-[#0077B5] hover:shadow-sm active:scale-95"
                title="Share on LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e2da] bg-white text-[#6b6560] transition-all hover:border-[#25D366] hover:text-[#25D366] hover:shadow-sm active:scale-95"
                title="Share on WhatsApp"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e2da] bg-white text-[#6b6560] transition-all hover:border-[#1b1b1b] hover:text-[#1b1b1b] hover:shadow-sm active:scale-95"
                title="Share on X"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 border-t border-[#e8e2da]" />

          {/* Done button */}
          <button
            onClick={onClose}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-[#6b6560] transition-colors hover:bg-[#f5f0ea] hover:text-[#4a4540]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
