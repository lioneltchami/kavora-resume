"use client";

import { useCallback, useEffect, useState } from "react";
import ProGate from "@/components/ProGate";
import ProjectEditor from "@/components/ProjectEditor";
import TestimonialEditor from "@/components/TestimonialEditor";
import type {
	PortfolioProject,
	PortfolioSettings,
	PortfolioTestimonial,
} from "@/lib/portfolio-types";
import {
	emptyPortfolioProject,
	PROJECT_CATEGORIES,
} from "@/lib/portfolio-types";
import { PALETTES } from "@/lib/types";

type TabId = "settings" | "projects" | "testimonials" | "analytics";

type ProjectDraft = Omit<PortfolioProject, "id" | "user_id" | "created_at"> & {
	id?: string;
};

type TestimonialDraft = Omit<
	PortfolioTestimonial,
	"id" | "user_id" | "created_at"
> & {
	id?: string;
};

interface PortfolioEditorProps {
	settings: PortfolioSettings;
	projects: PortfolioProject[];
	testimonials: PortfolioTestimonial[];
	isPro: boolean;
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
	onSettingsChange,
	onProjectsChange,
	onTestimonialsChange,
}: PortfolioEditorProps) {
	const [activeTab, setActiveTab] = useState<TabId>("settings");
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
					const updated = (await res.json()) as PortfolioProject;
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
					const created = (await res.json()) as PortfolioProject;
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
					const updated = (await res.json()) as PortfolioTestimonial;
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
					const created = (await res.json()) as PortfolioTestimonial;
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

	const tabs: { id: TabId; label: string; proBadge?: boolean }[] = [
		{ id: "settings", label: "Settings" },
		{ id: "projects", label: "Projects" },
		{ id: "testimonials", label: "Testimonials", proBadge: !isPro },
		{ id: "analytics", label: "Analytics" },
	];

	return (
		<div className="mx-auto max-w-2xl">
			{/* Tab bar */}
			<div className="mb-6 flex border-b border-[#e8e2da]">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => handleTabClick(tab.id)}
						className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
							activeTab === tab.id
								? "border-b-2 border-[#1e2a3a] text-[#1b1b1b]"
								: "text-[#6b6560] hover:text-[#4a4540]"
						}`}
					>
						{tab.label}
						{tab.proBadge && (
							<span className="ml-1.5 rounded-sm bg-[#b08d57]/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[#b08d57]">
								Pro
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
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
							Your bio
						</label>
						<p className="mb-2 text-xs text-[#b5b0a8]">
							Appears at the top of your portfolio
						</p>
						<textarea
							value={settings.bio}
							onChange={(e) => updateSettings({ bio: e.target.value })}
							rows={4}
							placeholder="Tell visitors about yourself..."
							className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57] resize-none"
						/>
					</div>

					{/* Avatar URL */}
					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
							Avatar image URL
						</label>
						<input
							type="url"
							value={settings.avatar_url ?? ""}
							onChange={(e) =>
								updateSettings({ avatar_url: e.target.value || null })
							}
							placeholder="https://example.com/avatar.jpg"
							className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
						/>
					</div>

					{/* Theme Color */}
					<div>
						<label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
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
											className={`h-9 w-9 rounded-full transition-all ${
												isSelected
													? "ring-2 ring-[#b08d57] ring-offset-2"
													: "ring-1 ring-[#e8e2da] group-hover:ring-[#b08d57]/50"
											}`}
											style={{ backgroundColor: palette.primary }}
										/>
										<span className="text-[0.6rem] text-[#6b6560]">
											{palette.name}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Social Links */}
					<div>
						<label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
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
									<label className="mb-1 block text-xs text-[#6b6560]">
										{label}
									</label>
									<input
										type="url"
										value={settings.social_links[key] ?? ""}
										onChange={(e) => updateSocialLink(key, e.target.value)}
										placeholder={placeholder}
										className="w-full border border-[#d4cfc8] rounded-lg px-3 py-2 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
									/>
								</div>
							))}
						</div>
					</div>

					{/* Toggles */}
					<div className="space-y-3">
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
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
								className="h-4 w-4 rounded border-[#d4cfc8] text-[#1e2a3a] focus:ring-[#b08d57]"
							/>
							<span className="text-sm text-[#1b1b1b]">Show contact form</span>
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
								className="h-4 w-4 rounded border-[#d4cfc8] text-[#1e2a3a] focus:ring-[#b08d57]"
							/>
							<span className="text-sm text-[#1b1b1b]">
								Show testimonials
								{!isPro && (
									<span className="ml-1.5 rounded-sm bg-[#b08d57]/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[#b08d57]">
										Pro
									</span>
								)}
							</span>
						</label>
					</div>

					{/* Portfolio URL */}
					{settings.slug && (
						<div className="rounded-lg border border-[#e8e2da] bg-[#faf8f5] px-4 py-3">
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
								Portfolio URL
							</label>
							<a
								href={`/p/${settings.slug}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-[#b08d57] underline hover:text-[#9a7a4a]"
							>
								{typeof window !== "undefined"
									? `${window.location.origin}/p/${settings.slug}`
									: `/p/${settings.slug}`}
							</a>
							<p className="mt-1 text-xs text-[#b5b0a8]">
								Matches your resume URL
							</p>
						</div>
					)}
				</div>
			)}

			{/* Projects Tab */}
			{activeTab === "projects" && (
				<div className="space-y-4">
					{/* Project count / limit */}
					<div className="flex items-center justify-between">
						<p className="text-sm text-[#6b6560]">
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
											className="ml-2 text-[#b08d57] underline hover:text-[#9a7a4a]"
										>
											Upgrade
										</button>
									)}
								</>
							)}
						</p>
						<button
							onClick={handleAddProject}
							className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e2a3a] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3f54]"
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
						<div className="flex items-center gap-2 text-sm text-[#6b6560]">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e2a3a]" />
							Saving project...
						</div>
					)}

					{/* Project list */}
					{projects.length === 0 && !editingProject && (
						<div className="rounded-lg border border-dashed border-[#d4cfc8] py-12 text-center">
							<p className="text-sm text-[#6b6560]">
								No projects yet. Add your first project to get started.
							</p>
						</div>
					)}

					{projects.map((project) => (
						<div
							key={project.id}
							className="flex items-start gap-4 rounded-xl border border-[#e8e2da] bg-white p-4"
						>
							{/* Thumbnail */}
							{project.image_url && (
								<img
									src={project.image_url}
									alt={project.title}
									className="h-16 w-20 shrink-0 rounded-lg border border-[#e8e2da] object-cover"
								/>
							)}

							{/* Info */}
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<h3 className="truncate text-sm font-semibold text-[#1b1b1b]">
										{project.title}
									</h3>
									<span className="shrink-0 rounded-full bg-[#f5f0ea] px-2 py-0.5 text-[0.65rem] font-medium text-[#6b6560]">
										{categoryLabel(project.category)}
									</span>
								</div>
								{project.description && (
									<p className="mt-1 line-clamp-2 text-xs text-[#6b6560]">
										{project.description}
									</p>
								)}
							</div>

							{/* Actions */}
							<div className="flex shrink-0 items-center gap-1">
								<button
									onClick={() => handleEditProject(project)}
									className="rounded-lg p-1.5 text-[#6b6560] transition-colors hover:bg-[#f5f0ea] hover:text-[#1b1b1b]"
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
									className="rounded-lg p-1.5 text-[#6b6560] transition-colors hover:bg-red-50 hover:text-red-500"
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

					{projects.length > 1 && (
						<p className="text-center text-xs text-[#b5b0a8]">
							Tip: Projects display in the order shown
						</p>
					)}
				</div>
			)}

			{/* Testimonials Tab */}
			{activeTab === "testimonials" && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm text-[#6b6560]">
							{testimonials.length} testimonial
							{testimonials.length !== 1 ? "s" : ""}
						</p>
						<button
							onClick={handleAddTestimonial}
							className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e2a3a] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3f54]"
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
						<div className="flex items-center gap-2 text-sm text-[#6b6560]">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e2a3a]" />
							Saving testimonial...
						</div>
					)}

					{testimonials.length === 0 && !editingTestimonial && (
						<div className="rounded-lg border border-dashed border-[#d4cfc8] py-12 text-center">
							<p className="text-sm text-[#6b6560]">
								No testimonials yet. Add testimonials from clients or
								colleagues.
							</p>
						</div>
					)}

					{testimonials.map((t) => (
						<div
							key={t.id}
							className="rounded-xl border border-[#e8e2da] bg-white p-4"
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									{t.avatar_url ? (
										<img
											src={t.avatar_url}
											alt={t.name}
											className="h-10 w-10 rounded-full border border-[#e8e2da] object-cover"
										/>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e2a3a] text-sm font-semibold text-white">
											{t.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div>
										<p className="text-sm font-semibold text-[#1b1b1b]">
											{t.name}
										</p>
										{(t.role || t.company) && (
											<p className="text-xs text-[#6b6560]">
												{[t.role, t.company].filter(Boolean).join(" at ")}
											</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-1">
									<button
										onClick={() => handleEditTestimonial(t)}
										className="rounded-lg p-1.5 text-[#6b6560] transition-colors hover:bg-[#f5f0ea] hover:text-[#1b1b1b]"
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
										className="rounded-lg p-1.5 text-[#6b6560] transition-colors hover:bg-red-50 hover:text-red-500"
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
							<p className="mt-3 text-sm italic text-[#4a4540] leading-relaxed">
								&ldquo;{t.text}&rdquo;
							</p>
						</div>
					))}
				</div>
			)}

			{/* Analytics Tab */}
			{activeTab === "analytics" && (
				<div className="space-y-4">
					{!settings.slug ? (
						<div className="rounded-lg border border-dashed border-[#d4cfc8] py-12 text-center">
							<p className="text-sm text-[#6b6560]">
								Publish your portfolio to start seeing analytics.
							</p>
						</div>
					) : viewsLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#1e2a3a]" />
						</div>
					) : viewsData ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="rounded-xl border border-[#e8e2da] bg-white p-5 text-center">
								<p className="text-3xl font-bold text-[#1b1b1b]">
									{viewsData.views}
								</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
									Total Views
								</p>
							</div>
							<div className="rounded-xl border border-[#e8e2da] bg-white p-5 text-center">
								<p className="text-3xl font-bold text-[#1b1b1b]">
									{viewsData.last7}
								</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
									Views This Week
								</p>
							</div>
							<div className="rounded-xl border border-[#e8e2da] bg-white p-5 text-center">
								<p className="text-3xl font-bold text-[#1b1b1b]">
									{viewsData.last30}
								</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6b6560]">
									Views This Month
								</p>
							</div>
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
