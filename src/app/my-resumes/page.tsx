"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type DashboardResume,
  groupResumesForDashboard,
  portfolioSlugForResume,
} from "@/lib/resume-groups";

interface SavedResume extends DashboardResume {}

const SAVED_KEY = "kavora-saved-resumes";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function readLocalResumes(): SavedResume[] {
  try {
    const stored = localStorage.getItem(SAVED_KEY);
    return stored ? (JSON.parse(stored) as SavedResume[]) : [];
  } catch {
    return [];
  }
}

export default function MyResumesPage() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [mounted, setMounted] = useState(false);
  const [offline, setOffline] = useState(false);

  // The account is the source of truth; localStorage is only a fallback so the
  // list still renders if the request fails.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setResumes(readLocalResumes());

      try {
        const res = await fetch("/api/resume?mine=1");
        if (!res.ok) throw new Error("Failed to load resumes");

        const { resumes: cloudResumes } = (await res.json()) as {
          resumes?: SavedResume[];
        };

        if (cancelled) return;

        if (Array.isArray(cloudResumes)) {
          setResumes(cloudResumes);
          setOffline(false);
          localStorage.setItem(SAVED_KEY, JSON.stringify(cloudResumes));
        }
      } catch (err) {
        console.error("My Resumes load error:", err);
        if (!cancelled) setOffline(true);
      } finally {
        if (!cancelled) setMounted(true);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(slug: string) {
    if (
      !confirm(
        "Delete this resume permanently? Its shared link and published page will stop working.",
      )
    )
      return;

    const previous = resumes;
    const updated = resumes.filter((r) => r.slug !== slug);
    setResumes(updated);

    try {
      const res = await fetch("/api/resume", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error("Failed to delete resume");
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Resume delete error:", err);
      setResumes(previous);
      alert("Could not delete that resume. Please try again.");
    }
  }

  const groups = useMemo(() => groupResumesForDashboard(resumes), [resumes]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Navigation */}
      <header className="border-b border-border-light bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/kavora-logo.png"
              alt="Kavora"
              width={26}
              height={22}
              className="opacity-80"
            />
            <span className="text-[0.8rem] font-semibold tracking-[0.03em] text-navy">
              Kavora
            </span>
          </Link>

          <Link
            href="/create/portfolio"
            className="inline-flex items-center gap-2 rounded-sm border border-[#b08d57] px-5 py-2.5 text-[0.8125rem] font-medium tracking-wide text-[#b08d57] transition-all hover:bg-[#b08d57] hover:text-white"
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
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            My Portfolio
          </Link>
          <Link
            href="/create?new=true"
            className="inline-flex items-center gap-2 rounded-sm bg-navy px-5 py-2.5 text-[0.8125rem] font-medium tracking-wide text-white transition-all hover:bg-navy-light hover:shadow-md"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create New
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Page header */}
          <div className="mb-10 text-center">
            <p className="text-[0.6875rem] font-medium tracking-[0.3em] uppercase text-gold">
              Your Workspace
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy sm:text-5xl">
              Resumes & Portfolios
            </h1>
            <div className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>

          {offline && (
            <div className="mx-auto mb-8 max-w-md rounded-sm border border-gold/40 bg-gold/5 px-5 py-4 text-center text-[0.8rem] leading-relaxed text-navy">
              We couldn&apos;t reach your account just now, so this list may be
              out of date. Refresh to try again.
            </div>
          )}

          {/* Empty state */}
          {resumes.length === 0 && (
            <div className="mx-auto max-w-md rounded-sm border border-border-light bg-white/50 px-8 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border text-text-muted">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-navy">
                No resumes yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                You haven&apos;t saved any resumes yet. Create your first resume
                — your portfolio will be ready at /p/your-name once you publish.
              </p>
              <Link
                href="/create?new=true"
                className="btn-primary mt-6 inline-flex"
              >
                Create Your Resume
                <span className="text-gold-light" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </div>
          )}

          {/* Resume cards */}
          {resumes.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map(({ parent, children }) => (
                <div key={parent.slug} className="space-y-3">
                  <ResumeCard
                    resume={parent}
                    onDelete={handleDelete}
                    showPortfolio
                  />
                  {children.length > 0 && (
                    <div className="ml-3 space-y-3 border-l-2 border-gold/25 pl-3">
                      {children.map((child) => (
                        <ResumeCard
                          key={child.slug}
                          resume={child}
                          onDelete={handleDelete}
                          tailored
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-light px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3">
          <Image
            src="/kavora-logo.png"
            alt="Kavora Systems"
            width={24}
            height={20}
            className="opacity-40"
          />
          <p className="text-xs tracking-[0.15em] text-text-muted/60">
            &copy; 2026 Kavora Systems
          </p>
        </div>
      </footer>
    </div>
  );
}

function ResumeCard({
  resume,
  onDelete,
  showPortfolio = false,
  tailored = false,
}: {
  resume: SavedResume;
  onDelete: (slug: string) => void;
  showPortfolio?: boolean;
  tailored?: boolean;
}) {
  const portfolioSlug = portfolioSlugForResume(resume);
  const label = resume.label?.trim();

  return (
    <div
      className={`group rounded-sm border border-border-light bg-white/70 p-6 transition-all duration-300 hover:border-gold hover:bg-white hover:shadow-md ${
        tailored ? "bg-white/90 p-5" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-navy">
            {resume.name || "Untitled Resume"}
          </h3>
          {label && (
            <span className="mt-1.5 inline-flex rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-gold-dark">
              {label}
            </span>
          )}
        </div>
        {resume.paletteId && (
          <span className="mt-1 shrink-0 rounded-full border border-border-light px-2.5 py-0.5 text-[0.65rem] tracking-wide text-text-muted">
            {resume.paletteId.replace("-", " ")}
          </span>
        )}
      </div>

      <Link
        href={`/r/${resume.slug}`}
        className="inline-block text-[0.8rem] text-gold-dark transition-colors hover:text-gold"
      >
        /r/{resume.slug}
      </Link>

      <p className="mt-2 text-xs text-text-muted/70">
        Last saved {formatDate(resume.savedAt)}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-light pt-4">
        <Link
          href={`/create?edit=${resume.slug}`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-3.5 py-2 text-[0.75rem] font-medium text-navy transition-all hover:border-navy hover:bg-navy hover:text-white"
        >
          Edit
        </Link>
        <Link
          href={`/create?edit=${resume.slug}&job=1`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-3.5 py-2 text-[0.75rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
        >
          Tailor again
        </Link>
        <Link
          href={`/r/${resume.slug}`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-3.5 py-2 text-[0.75rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
        >
          Resume
        </Link>
        {showPortfolio && (
          <Link
            href={`/p/${portfolioSlug}`}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-3.5 py-2 text-[0.75rem] font-medium text-navy transition-all hover:border-gold hover:text-gold"
          >
            Portfolio
          </Link>
        )}
        <button
          onClick={() => onDelete(resume.slug)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-[0.75rem] font-medium text-text-muted/60 transition-all hover:bg-red-50 hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
