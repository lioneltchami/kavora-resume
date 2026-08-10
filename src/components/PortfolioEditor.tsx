"use client";

import { useCallback, useEffect, useState } from "react";
import ProGate from "@/components/ProGate";
import ProjectEditor from "@/components/ProjectEditor";
import TestimonialEditor from "@/components/TestimonialEditor";
import type {
  PortfolioContactMessage,
  PortfolioProject,
  PortfolioSettings,
  PortfolioTestimonial,
} from "@/lib/portfolio-types";
import {
  emptyPortfolioProject,
  PROJECT_CATEGORIES,
} from "@/lib/portfolio-types";
import { PALETTES } from "@/lib/types";

type TabId =
  "settings" | "projects" | "testimonials" | "messages" | "analytics";

type ProjectDraft = Omit<PortfolioProject, "id" | "user_id" | "created_at"> & {
  id?: string;
};

type TestimonialDraft = Omit<
  PortfolioTestimonial,
  "id" | "user_id" | "created_at"
> & {
  id?: string;
};

const TAB_IDS: TabId[] = [
  "settings",
  "projects",
  "testimonials",
  "messages",
  "analytics",
];

export function resolvePortfolioTab(
  raw: string | null | undefined,
): TabId | null {
  if (!raw) return null;
  return TAB_IDS.includes(raw as TabId) ? (raw as TabId) : null;
}

interface PortfolioEditorProps {
  settings: PortfolioSettings;
  projects: PortfolioProject[];
  testimonials: PortfolioTestimonial[];
  isPro: boolean;
  initialTab?: TabId | null;
  onSettingsChange: (settings: PortfolioSettings) => void;
  onProjectsChange: (projects: PortfolioProject[]) => void;
  onTestimonialsChange: (testimonials: PortfolioTestimonial[]) => void;
}

interface ViewsData {
  views: number;
  last7: number;
  last30: number;
}

const FREE_PROJECT_LIMIT = 3;

export default function PortfolioEditor({
  settings,
  projects,
  testimonials,
  isPro,
  initialTab = null,
  onSettingsChange,
  onProjectsChange,
  onTestimonialsChange,
}: PortfolioEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (!initialTab) return "settings";
    if (initialTab === "testimonials" && !isPro) return "settings";
    return initialTab;
  });
  const [proGateInfo, setProGateInfo] = useState<{
    feature: string;
    description: string;
  } | null>(null);

  // Project editing state
  const [editingProject, setEditingProject] = useState<ProjectDraft | null>(
    null,
  );
  const [projectSaving, setProjectSaving] = useState(false);

  // Testimonial editing state
  const [editingTestimonial, setEditingTestimonial] =
    useState<TestimonialDraft | null>(null);
  const [testimonialSaving, setTestimonialSaving] = useState(false);

  // Analytics state
  const [viewsData, setViewsData] = useState<ViewsData | null>(null);
  const [viewsLoading, setViewsLoading] = useState(false);

  // Contact inbox state
  const [messages, setMessages] = useState<PortfolioContactMessage[] | null>(
    null,
  );
  const [messagesLoading, setMessagesLoading] = useState(false);

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch("/api/portfolio/messages");
      if (!res.ok) throw new Error("Failed to load messages");
      const data = (await res.json()) as {
        messages?: PortfolioContactMessage[];
      };
      setMessages(data.messages ?? []);
    } catch (err) {
      console.error("Messages load error:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Unread badge should be visible without opening the tab first.
  useEffect(() => {
    if (settings.slug) {
      void loadMessages();
    }
  }, [settings.slug, loadMessages]);

  async function handleToggleRead(message: PortfolioContactMessage) {
    const nextRead = !message.is_read;
    setMessages(
      (current) =>
        current?.map((m) =>
          m.id === message.id ? { ...m, is_read: nextRead } : m,
        ) ?? null,
    );

    try {
      const res = await fetch("/api/portfolio/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id, is_read: nextRead }),
      });
      if (!res.ok) throw new Error("Failed to update message");
    } catch (err) {
      console.error("Message update error:", err);
      void loadMessages();
    }
  }

  async function handleDeleteMessage(id: string) {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;

    const previous = messages;
    setMessages((current) => current?.filter((m) => m.id !== id) ?? null);

    try {
      const res = await fetch("/api/portfolio/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete message");
    } catch (err) {
      console.error("Message delete error:", err);
      setMessages(previous);
    }
  }

  function formatMessageDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString("en-US", {
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

  // Fetch analytics when tab is selected
  useEffect(() => {
    if (activeTab === "analytics" && settings.slug && !viewsData) {
      setViewsLoading(true);
      fetch(`/api/portfolio/views?slug=${encodeURIComponent(settings.slug)}`)
        .then((res) => res.json())
        .then((data: ViewsData) => setViewsData(data))
        .catch(() => setViewsData({ views: 0, last7: 0, last30: 0 }))
        .finally(() => setViewsLoading(false));
    }
  }, [activeTab, settings.slug, viewsData]);

  function handleTabClick(tab: TabId) {
    if (tab === "testimonials" && !isPro) {
      setProGateInfo({
        feature: "Testimonials",
        description:
          "Add client testimonials to your portfolio to build trust and credibility.",
      });
      return;
    }
    setActiveTab(tab);
  }

  // --- Settings helpers ---
  function updateSettings(patch: Partial<PortfolioSettings>) {
    onSettingsChange({ ...settings, ...patch });
  }

  function updateSocialLink(
    key: keyof PortfolioSettings["social_links"],
    value: string,
  ) {
    onSettingsChange({
      ...settings,
      social_links: { ...settings.social_links, [key]: value || undefined },
    });
  }

  // --- Project CRUD ---
  function handleAddProject() {
    if (!isPro && projects.length >= FREE_PROJECT_LIMIT) {
      setProGateInfo({
        feature: "Unlimited Projects",
        description:
          "Free plans are limited to 3 projects. Upgrade for unlimited portfolio projects.",
      });
      return;
    }
    setEditingProject({
      ...emptyPortfolioProject,
      slug: settings.slug,
      display_order: projects.length,
    });
  }

  function handleEditProject(project: PortfolioProject) {
    setEditingProject({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      category: project.category,
      image_url: project.image_url,
      live_url: project.live_url,
      display_order: project.display_order,
    });
  }

  const handleSaveProject = useCallback(
    async (draft: ProjectDraft) => {
      setProjectSaving(true);
      try {
        if (draft.id) {
          // Update
          const res = await fetch("/api/portfolio/projects", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          if (!res.ok) throw new Error("Failed to update project");
          const { project: updated } = (await res.json()) as {
            project: PortfolioProject;
          };
          onProjectsChange(
            projects.map((p) => (p.id === updated.id ? updated : p)),
          );
        } else {
          // Create
          const res = await fetch("/api/portfolio/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          if (!res.ok) throw new Error("Failed to create project");
          const { project: created } = (await res.json()) as {
            project: PortfolioProject;
          };
          onProjectsChange([...projects, created]);
        }
        setEditingProject(null);
      } catch (err) {
        console.error("Project save error:", err);
      } finally {
        setProjectSaving(false);
      }
    },
    [projects, onProjectsChange],
  );

  async function handleDeleteProject(id: string) {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch("/api/portfolio/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete project");
      onProjectsChange(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Project delete error:", err);
    }
  }

  // --- Testimonial CRUD ---
  function handleAddTestimonial() {
    setEditingTestimonial({
      name: "",
      role: "",
      company: "",
      avatar_url: null,
      text: "",
      display_order: testimonials.length,
    });
  }

  function handleEditTestimonial(t: PortfolioTestimonial) {
    setEditingTestimonial({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      avatar_url: t.avatar_url,
      text: t.text,
      display_order: t.display_order,
    });
  }

  const handleSaveTestimonial = useCallback(
    async (draft: TestimonialDraft) => {
      setTestimonialSaving(true);
      try {
        if (draft.id) {
          const res = await fetch("/api/portfolio/testimonials", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          if (!res.ok) throw new Error("Failed to update testimonial");
          const { testimonial: updated } = (await res.json()) as {
            testimonial: PortfolioTestimonial;
          };
          onTestimonialsChange(
            testimonials.map((t) => (t.id === updated.id ? updated : t)),
          );
        } else {
          const res = await fetch("/api/portfolio/testimonials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          if (!res.ok) throw new Error("Failed to create testimonial");
          const { testimonial: created } = (await res.json()) as {
            testimonial: PortfolioTestimonial;
          };
          onTestimonialsChange([...testimonials, created]);
        }
        setEditingTestimonial(null);
      } catch (err) {
        console.error("Testimonial save error:", err);
      } finally {
        setTestimonialSaving(false);
      }
    },
    [testimonials, onTestimonialsChange],
  );

  async function handleDeleteTestimonial(id: string) {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch("/api/portfolio/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");
      onTestimonialsChange(testimonials.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Testimonial delete error:", err);
    }
  }

  // --- Category badge helper ---
  function categoryLabel(value: string): string {
    return PROJECT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
  }

  const tabs: {
    id: TabId;
    label: string;
    proBadge?: boolean;
    count?: number;
  }[] = [
    { id: "settings", label: "Settings" },
    { id: "projects", label: "Projects" },
    { id: "testimonials", label: "Testimonials", proBadge: !isPro },
    { id: "messages", label: "Messages", count: unreadCount },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Tab bar */}
      <div className="mb-6 flex border-b border-rule">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-ink text-ink"
                : "text-ink-2 hover:text-ink-2"
            }`}
          >
            {tab.label}
            {tab.proBadge && (
              <span className="ml-1.5 rounded-sm bg-accent/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent">
                Pro
              </span>
            )}
            {!tab.proBadge && Boolean(tab.count) && (
              <span className="ml-1.5 font-mono text-xs font-normal text-ink-2">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Bio */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
              Your bio
            </label>
            <p className="mb-2 text-xs text-ink-2">
              Appears at the top of your portfolio
            </p>
            <textarea
              value={settings.bio}
              onChange={(e) => updateSettings({ bio: e.target.value })}
              rows={4}
              placeholder="Tell visitors about yourself..."
              className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
              Avatar image URL
            </label>
            <input
              type="url"
              value={settings.avatar_url ?? ""}
              onChange={(e) =>
                updateSettings({ avatar_url: e.target.value || null })
              }
              placeholder="https://example.com/avatar.jpg"
              className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Theme Color */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-2">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-3">
              {PALETTES.map((palette) => {
                const isSelected = settings.theme_color === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => updateSettings({ theme_color: palette.id })}
                    className="group flex flex-col items-center gap-1.5"
                    title={palette.name}
                  >
                    <div
                      className={`h-9 w-9 rounded-[2px] transition-all ${
                        isSelected
                          ? "ring-2 ring-accent ring-offset-2"
                          : "ring-1 ring-rule group-hover:ring-accent/50"
                      }`}
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span className="text-[0.6rem] text-ink-2">
                      {palette.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-ink-2">
              Social Links
            </label>
            <div className="space-y-3">
              {(
                [
                  {
                    key: "linkedin" as const,
                    label: "LinkedIn",
                    placeholder: "https://linkedin.com/in/...",
                  },
                  {
                    key: "github" as const,
                    label: "GitHub",
                    placeholder: "https://github.com/...",
                  },
                  {
                    key: "twitter" as const,
                    label: "Twitter",
                    placeholder: "https://twitter.com/...",
                  },
                  {
                    key: "website" as const,
                    label: "Website",
                    placeholder: "https://...",
                  },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-ink-2">
                    {label}
                  </label>
                  <input
                    type="url"
                    value={settings.social_links[key] ?? ""}
                    onChange={(e) => updateSocialLink(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-rule rounded-[2px] px-3 py-2 text-sm text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
              Display Options
            </label>

            {/* Show contact form */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_contact_form}
                onChange={(e) =>
                  updateSettings({ show_contact_form: e.target.checked })
                }
                className="h-4 w-4 rounded border-rule text-ink focus:ring-accent"
              />
              <span className="text-sm text-ink">Show contact form</span>
            </label>

            {/* Show testimonials */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_testimonials}
                onChange={(e) => {
                  if (e.target.checked && !isPro) {
                    e.preventDefault();
                    setProGateInfo({
                      feature: "Show Testimonials",
                      description:
                        "Display testimonials on your portfolio page to build credibility with visitors.",
                    });
                    return;
                  }
                  updateSettings({ show_testimonials: e.target.checked });
                }}
                className="h-4 w-4 rounded border-rule text-ink focus:ring-accent"
              />
              <span className="text-sm text-ink">
                Show testimonials
                {!isPro && (
                  <span className="ml-1.5 rounded-sm bg-accent/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent">
                    Pro
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Portfolio URL */}
          {settings.slug && (
            <div className="rounded-[2px] border border-rule bg-paper px-4 py-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-2">
                Portfolio URL
              </label>
              <a
                href={`/p/${settings.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline hover:text-accent"
              >
                {typeof window !== "undefined"
                  ? `${window.location.origin}/p/${settings.slug}`
                  : `/p/${settings.slug}`}
              </a>
              <p className="mt-1 text-xs text-ink-2">Matches your resume URL</p>
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {/* Project count / limit */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-2">
              {isPro ? (
                "Unlimited projects"
              ) : (
                <>
                  {projects.length}/{FREE_PROJECT_LIMIT} projects used
                  {projects.length >= FREE_PROJECT_LIMIT && (
                    <button
                      onClick={() =>
                        setProGateInfo({
                          feature: "Unlimited Projects",
                          description:
                            "Free plans are limited to 3 projects. Upgrade for unlimited portfolio projects.",
                        })
                      }
                      className="ml-2 text-accent underline hover:text-accent"
                    >
                      Upgrade
                    </button>
                  )}
                </>
              )}
            </p>
            <button
              onClick={handleAddProject}
              className="inline-flex items-center gap-1.5 rounded-[2px] bg-ink px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-light"
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
              Add Project
            </button>
          </div>

          {/* Inline editor for new/editing project */}
          {editingProject && (
            <ProjectEditor
              project={editingProject}
              slug={settings.slug}
              onSave={(draft) => void handleSaveProject(draft)}
              onCancel={() => setEditingProject(null)}
            />
          )}

          {projectSaving && (
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-ink" />
              Saving project...
            </div>
          )}

          {/* Project list */}
          {projects.length === 0 && !editingProject && (
            <div className="border-t border-rule py-10 text-left">
              <p className="text-sm text-ink-2">
                No projects yet. Add your first project to get started.
              </p>
            </div>
          )}

          {projects.length > 0 && (
            <div className="border-t border-rule">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start gap-4 border-b border-rule py-4"
                >
                  {project.image_url && (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-16 w-20 shrink-0 rounded-[2px] border border-rule object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h3 className="truncate text-sm font-semibold text-ink">
                        {project.title}
                      </h3>
                      <span className="font-mono text-xs text-ink-2">
                        {categoryLabel(project.category)}
                      </span>
                    </div>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-2">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="rounded-[2px] p-1.5 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                      title="Edit"
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="rounded-[2px] p-1.5 text-ink-2 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Delete"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 1 && (
            <p className="text-left text-xs text-ink-2">
              Tip: Projects display in the order shown
            </p>
          )}
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === "testimonials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-2">
              {testimonials.length} testimonial
              {testimonials.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={handleAddTestimonial}
              className="inline-flex items-center gap-1.5 rounded-[2px] bg-ink px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-light"
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
              Add Testimonial
            </button>
          </div>

          {editingTestimonial && (
            <TestimonialEditor
              testimonial={editingTestimonial}
              onSave={(draft) => void handleSaveTestimonial(draft)}
              onCancel={() => setEditingTestimonial(null)}
            />
          )}

          {testimonialSaving && (
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-ink" />
              Saving testimonial...
            </div>
          )}

          {testimonials.length === 0 && !editingTestimonial && (
            <div className="border-t border-rule py-10 text-left">
              <p className="text-sm text-ink-2">
                No testimonials yet. Add testimonials from clients or
                colleagues.
              </p>
            </div>
          )}

          {testimonials.length > 0 && (
            <div className="border-t border-rule">
              {testimonials.map((t) => (
                <div key={t.id} className="border-b border-rule py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {t.avatar_url ? (
                        <img
                          src={t.avatar_url}
                          alt={t.name}
                          className="h-10 w-10 rounded-[2px] border border-rule object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-ink text-sm font-semibold text-white">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {t.name}
                        </p>
                        {(t.role || t.company) && (
                          <p className="text-xs text-ink-2">
                            {[t.role, t.company].filter(Boolean).join(" at ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditTestimonial(t)}
                        className="rounded-[2px] p-1.5 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                        title="Edit"
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
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="rounded-[2px] p-1.5 text-ink-2 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete"
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
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Contact messages</p>
              <p className="mt-0.5 text-xs text-ink-2">
                {settings.show_contact_form
                  ? "Messages visitors send through your portfolio contact form."
                  : "Your contact form is off — turn it on in Settings to receive messages."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadMessages()}
              disabled={messagesLoading || !settings.slug}
              className="rounded-[2px] border border-rule bg-paper px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {!settings.slug ? (
            <div className="border-t border-rule py-10 text-left">
              <p className="text-sm text-ink-2">
                Publish your portfolio to start receiving messages.
              </p>
            </div>
          ) : messagesLoading && messages === null ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-ink" />
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="border-t border-rule py-10 text-left">
              <p className="text-sm text-ink-2">
                No messages yet. They&apos;ll show up here as soon as someone
                reaches out.
              </p>
            </div>
          ) : (
            messages?.map((message) => (
              <div
                key={message.id}
                className={`rounded-[2px] border bg-paper p-4 ${
                  message.is_read
                    ? "border-rule"
                    : "border-accent/50 bg-accent/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {message.sender_name}
                      </p>
                      {!message.is_read && (
                        <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent">
                          New
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${message.sender_email}?subject=${encodeURIComponent(
                        "Re: your message via my Kavora portfolio",
                      )}`}
                      className="text-xs text-accent underline hover:text-accent"
                    >
                      {message.sender_email}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handleToggleRead(message)}
                      className="rounded-[2px] p-1.5 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                      title={
                        message.is_read ? "Mark as unread" : "Mark as read"
                      }
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        {message.is_read ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        )}
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteMessage(message.id)}
                      className="rounded-[2px] p-1.5 text-ink-2 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Delete"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                  {message.message}
                </p>
                <p className="mt-3 text-[0.7rem] text-ink-2">
                  {formatMessageDate(message.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          {!settings.slug ? (
            <div className="border-t border-rule py-10 text-left">
              <p className="text-sm text-ink-2">
                Publish your portfolio to start seeing analytics.
              </p>
            </div>
          ) : viewsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-ink" />
            </div>
          ) : viewsData ? (
            <div className="border-t border-rule">
              {(
                [
                  { label: "Total views", value: viewsData.views },
                  { label: "Views this week", value: viewsData.last7 },
                  { label: "Views this month", value: viewsData.last30 },
                ] as const
              ).map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-rule py-4"
                >
                  <p className="text-sm text-ink-2">{row.label}</p>
                  <p className="font-display text-2xl font-semibold text-ink">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Pro Gate Modal */}
      {proGateInfo && (
        <ProGate
          feature={proGateInfo.feature}
          description={proGateInfo.description}
          onClose={() => setProGateInfo(null)}
        />
      )}
    </div>
  );
}
