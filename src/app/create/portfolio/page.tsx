"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PortfolioEditor from "@/components/PortfolioEditor";
import UserMenu from "@/components/UserMenu";
import type {
  PortfolioSettings,
  PortfolioProject,
  PortfolioTestimonial,
} from "@/lib/portfolio-types";
import { emptyPortfolioSettings } from "@/lib/portfolio-types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function PortfolioEditorPage() {
  const [settings, setSettings] = useState<PortfolioSettings>(
    emptyPortfolioSettings,
  );
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [testimonials, setTestimonials] = useState<PortfolioTestimonial[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, projectsRes, testimonialsRes, proRes] =
          await Promise.all([
            fetch("/api/portfolio/settings"),
            fetch("/api/portfolio/projects"),
            fetch("/api/portfolio/testimonials"),
            fetch("/api/check-pro"),
          ]);

        if (settingsRes.ok) {
          const settingsData = (await settingsRes.json()) as PortfolioSettings;
          if (settingsData.slug) {
            setSettings(settingsData);
          }
        }

        if (projectsRes.ok) {
          const projectsData = (await projectsRes.json()) as PortfolioProject[];
          if (Array.isArray(projectsData)) {
            setProjects(projectsData);
          }
        }

        if (testimonialsRes.ok) {
          const testimonialsData =
            (await testimonialsRes.json()) as PortfolioTestimonial[];
          if (Array.isArray(testimonialsData)) {
            setTestimonials(testimonialsData);
          }
        }

        if (proRes.ok) {
          const proData = (await proRes.json()) as { isPro: boolean };
          setIsPro(proData.isPro);
        }
      } catch (err) {
        console.error("Failed to load portfolio data:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  // Auto-save settings (debounced)
  const saveSettings = useCallback((updated: PortfolioSettings) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("saving");

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/portfolio/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });

        if (!res.ok) throw new Error("Failed to save settings");
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 800);
  }, []);

  function handleSettingsChange(updated: PortfolioSettings) {
    setSettings(updated);
    saveSettings(updated);
  }

  function handleProjectsChange(updated: PortfolioProject[]) {
    setProjects(updated);
  }

  function handleTestimonialsChange(updated: PortfolioTestimonial[]) {
    setTestimonials(updated);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#faf8f5]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e8e2da] bg-white px-4 shadow-sm">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.03em] text-[#1b1b1b]"
        >
          <Image src="/kavora-logo.png" alt="Kavora" width={22} height={19} />
          <span className="hidden sm:inline">Kavora Portfolio Editor</span>
          <span className="sm:hidden">Kavora</span>
        </Link>

        {/* Center: Save status */}
        <div className="hidden items-center gap-1.5 text-sm text-[#6b6560] sm:flex">
          {saveStatus === "saving" && (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <svg
                className="h-4 w-4 text-green-500"
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
              <span className="text-green-600">All changes saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <span className="text-red-500">Failed to save</span>
          )}
          {saveStatus === "idle" && <span>Portfolio Editor</span>}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {settings.slug && (
            <Link
              href={`/p/${settings.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cfc8] bg-white px-3 py-2 text-[0.8rem] font-medium text-[#4a4540] transition-colors hover:border-[#b08d57] hover:text-[#b08d57]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              View Portfolio
            </Link>
          )}
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#6b6560] hover:text-[#b08d57] transition-colors"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            Resume Editor
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <PortfolioEditor
            settings={settings}
            projects={projects}
            testimonials={testimonials}
            isPro={isPro}
            onSettingsChange={handleSettingsChange}
            onProjectsChange={handleProjectsChange}
            onTestimonialsChange={handleTestimonialsChange}
          />
        </div>
      </div>
    </div>
  );
}
