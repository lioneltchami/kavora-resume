"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PortfolioContactForm from "@/components/PortfolioContactForm";
import type {
  PortfolioProject,
  PortfolioSettings,
  PortfolioSocialLinks,
  PortfolioTestimonial,
} from "@/lib/portfolio-types";
import { PROJECT_CATEGORIES } from "@/lib/portfolio-types";
import type { ResumeData } from "@/lib/types";
import { getPalette } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PortfolioPageProps {
  resume: ResumeData;
  settings: PortfolioSettings;
  projects: PortfolioProject[];
  testimonials: PortfolioTestimonial[];
  isOwner: boolean;
  slug: string;
}

/* ------------------------------------------------------------------ */
/*  Social link icons (inline SVG)                                     */
/* ------------------------------------------------------------------ */

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function QuoteIcon({ color }: { color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={color}
      opacity={0.2}
    >
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategoryLabel(value: string): string {
  const found = PROJECT_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}

/* ------------------------------------------------------------------ */
/*  Navigation tabs                                                    */
/* ------------------------------------------------------------------ */

interface NavTab {
  id: string;
  label: string;
}

function StickyNav({
  tabs,
  activeTab,
  accentColor,
}: {
  tabs: NavTab[];
  activeTab: string;
  accentColor: string;
}) {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative"
              style={{
                color: activeTab === tab.id ? accentColor : "#6b7280",
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Social links row                                                   */
/* ------------------------------------------------------------------ */

function SocialLinks({
  links,
  color,
}: {
  links: PortfolioSocialLinks;
  color: string;
}) {
  const items: {
    key: keyof PortfolioSocialLinks;
    icon: React.ReactNode;
    label: string;
  }[] = [
    { key: "linkedin", icon: <LinkedInIcon />, label: "LinkedIn" },
    { key: "github", icon: <GitHubIcon />, label: "GitHub" },
    { key: "twitter", icon: <TwitterIcon />, label: "Twitter" },
    { key: "website", icon: <WebsiteIcon />, label: "Website" },
  ];

  const activeLinks = items.filter((item) => links[item.key]);

  if (activeLinks.length === 0) return null;

  return (
    <div className="flex gap-3 mt-4">
      {activeLinks.map((item) => (
        <a
          key={item.key}
          href={links[item.key]}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full transition-opacity hover:opacity-80"
          style={{ color, backgroundColor: "rgba(255,255,255,0.15)" }}
          aria-label={item.label}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PortfolioPage({
  resume,
  settings,
  projects,
  testimonials,
  isOwner,
  slug,
}: PortfolioPageProps) {
  const palette = getPalette(settings.theme_color);
  const [activeTab, setActiveTab] = useState("about");

  // Build tabs list
  const tabs: NavTab[] = [{ id: "about", label: "About" }];
  if (projects.length > 0) {
    tabs.push({ id: "projects", label: "Projects" });
  }
  if (settings.show_testimonials && testimonials.length > 0) {
    tabs.push({ id: "testimonials", label: "Testimonials" });
  }
  if (settings.show_contact_form) {
    tabs.push({ id: "contact", label: "Contact" });
  }

  // IntersectionObserver for active tab tracking
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setSectionRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        sectionRefs.current.set(id, el);
      } else {
        sectionRefs.current.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Set<string>();

    const tabIds = tabs.map((t) => t.id);

    tabIds.forEach((id) => {
      const el = sectionRefs.current.get(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.add(id);
            } else {
              visibleSections.delete(id);
            }
          });

          // Pick the first visible section in tab order
          for (const tabId of tabIds) {
            if (visibleSections.has(tabId)) {
              setActiveTab(tabId);
              break;
            }
          }
        },
        { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f5" }}>
      {/* ============================================================ */}
      {/*  TOP NAV — back to Kavora home                                */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-100">
        <a
          href="/"
          className="flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.03em] text-navy opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: "#1e2a3a" }}
        >
          <svg width="18" height="16" viewBox="0 0 32 28" fill="none" aria-hidden="true">
            <path d="M16 2L2 14h4v12h8v-8h4v8h8V14h4L16 2z" fill="#1e2a3a" fillOpacity="0.8"/>
          </svg>
          Kavora
        </a>
        <a
          href="/"
          className="text-[0.75rem] transition-colors"
          style={{ color: "#6b6560" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#b08d57")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#6b6560")}
        >
          ← Back to home
        </a>
      </div>

      {/* ============================================================ */}
      {/*  HERO / HEADER                                                */}
      {/* ============================================================ */}
      <header
        className="relative py-16 px-4 sm:px-6"
        style={{ backgroundColor: palette.headerBg }}
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Avatar */}
          {settings.avatar_url && (
            <img
              src={settings.avatar_url}
              alt={resume.name}
              className="w-28 h-28 rounded-full object-cover border-4 mb-6"
              style={{ borderColor: palette.accent }}
            />
          )}

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            {resume.name}
          </h1>

          {/* Professional title */}
          {resume.title && (
            <p
              className="mt-2 text-lg sm:text-xl font-medium"
              style={{ color: palette.accent }}
            >
              {resume.title}
            </p>
          )}

          {/* Location */}
          {resume.location && (
            <p
              className="mt-2 text-sm"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {resume.location}
            </p>
          )}

          {/* Social links */}
          <SocialLinks links={settings.social_links} color={palette.accent} />

          {/* Owner edit link */}
          {isOwner && (
            <Link
              href="/create/portfolio"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
              style={{
                color: palette.accent,
                backgroundColor: "rgba(255,255,255,0.1)",
                border: `1px solid ${palette.accent}40`,
              }}
            >
              Edit Portfolio
            </Link>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/*  STICKY NAV                                                   */}
      {/* ============================================================ */}
      <StickyNav
        tabs={tabs}
        activeTab={activeTab}
        accentColor={palette.accent}
      />

      {/* ============================================================ */}
      {/*  ABOUT SECTION                                                */}
      {/* ============================================================ */}
      <section
        id="about"
        ref={setSectionRef("about")}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: palette.primary }}
        >
          About
        </h2>

        {/* Bio */}
        {settings.bio && (
          <p className="text-gray-700 leading-relaxed mb-10 max-w-3xl">
            {settings.bio}
          </p>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-10">
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: palette.primary }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    color: palette.primary,
                    backgroundColor: `${palette.accent}20`,
                    border: `1px solid ${palette.accent}40`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience timeline */}
        {resume.experience.length > 0 && (
          <div className="mb-10">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: palette.primary }}
            >
              Experience
            </h3>
            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-l-2 pl-4 py-1"
                  style={{ borderColor: palette.accent }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-sm" style={{ color: palette.accent }}>
                      {exp.company}
                      {exp.location ? ` \u2014 ${exp.location}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {exp.startDate} – {exp.endDate ?? "Present"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: palette.primary }}
            >
              Education
            </h3>
            <div className="space-y-3">
              {resume.education.map((edu) => (
                <div key={edu.id} className="flex flex-col">
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-sm text-gray-600">
                    {edu.school}
                    {edu.location ? ` \u2014 ${edu.location}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/*  PROJECTS SECTION                                             */}
      {/* ============================================================ */}
      {projects.length > 0 && (
        <section
          id="projects"
          ref={setSectionRef("projects")}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: palette.primary }}
          >
            Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {project.image_url && (
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: palette.primary,
                        backgroundColor: `${palette.accent}20`,
                      }}
                    >
                      {getCategoryLabel(project.category)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {project.description}
                  </p>
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ color: palette.accent }}
                    >
                      View Project
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  TESTIMONIALS SECTION                                         */}
      {/* ============================================================ */}
      {settings.show_testimonials && testimonials.length > 0 && (
        <section
          id="testimonials"
          ref={setSectionRef("testimonials")}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: palette.primary }}
          >
            Testimonials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative"
              >
                <div className="absolute top-4 right-4">
                  <QuoteIcon color={palette.accent} />
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 pr-8">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <img
                      src={t.avatar_url}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: palette.primary }}
                    >
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.role}
                      {t.company ? ` at ${t.company}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  CONTACT SECTION                                              */}
      {/* ============================================================ */}
      {settings.show_contact_form && (
        <section
          id="contact"
          ref={setSectionRef("contact")}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: palette.primary }}
          >
            Get in Touch
          </h2>
          <div className="max-w-lg">
            <PortfolioContactForm slug={slug} />
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer
        className="py-8 px-4 sm:px-6 mt-8"
        style={{ backgroundColor: palette.headerBg }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-white font-medium">{resume.name}</p>
          {resume.title && (
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {resume.title}
            </p>
          )}

          {/* Free tier branding */}
          {!resume.isPro && (
            <a
              href="/"
              className="inline-block mt-4 text-xs transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Built with Kavora
            </a>
          )}
        </div>
      </footer>

      {/* Free tier watermark on projects section */}
      {!resume.isPro && projects.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-full shadow-md transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
            }}
          >
            Made with Kavora
          </a>
        </div>
      )}
    </div>
  );
}
