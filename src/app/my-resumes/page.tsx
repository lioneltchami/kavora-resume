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
			<div className="flex min-h-screen items-center justify-center bg-paper">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-ink" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-paper">
			<header className="app-bar">
				<Link href="/" className="site-nav__brand">
					<Image src="/kavora-logo.png" alt="" width={20} height={17} />
					Kavora
				</Link>
				<div className="flex items-center gap-3">
					<Link href="/create/portfolio" className="btn-ghost">
						Portfolio
					</Link>
					<Link href="/create?new=true" className="btn-primary">
						Create new
					</Link>
				</div>
			</header>

			<main className="flex-1 px-[clamp(1rem,3.5vw,3rem)] py-10 md:py-14">
				<div className="max-w-3xl">
					<div className="mb-8 text-left">
						<h1 className="text-display-s text-ink">
							Resumes &amp; portfolios
						</h1>
						<p className="mt-3 text-sm text-ink-2">
							Base resumes and tailored copies, grouped for hire.
						</p>
					</div>

					{offline && (
						<div className="mb-8 border border-rule bg-paper-2 px-4 py-3 text-left text-sm leading-relaxed text-ink-2">
							We couldn&apos;t reach your account just now, so this list may be
							out of date. Refresh to try again.
						</div>
					)}

					{resumes.length === 0 && (
						<div className="border-t border-rule py-12 text-left">
							<h2 className="font-display text-xl font-semibold text-ink">
								No resumes yet
							</h2>
							<p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">
								You haven&apos;t saved any resumes yet. Create your first resume
								— your portfolio will be ready at /p/your-name once you publish.
							</p>
							<Link
								href="/create?new=true"
								className="btn-primary mt-6 inline-flex"
							>
								Create your resume →
							</Link>
						</div>
					)}

					{resumes.length > 0 && (
						<div className="border-t border-rule">
							{groups.map(({ parent, children }) => (
								<div key={parent.slug}>
									<ResumeRow
										resume={parent}
										onDelete={handleDelete}
										showPortfolio
									/>
									{children.map((child) => (
										<ResumeRow
											key={child.slug}
											resume={child}
											onDelete={handleDelete}
											tailored
										/>
									))}
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

function ResumeRow({
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
			className={`border-b border-rule py-5 ${tailored ? "pl-6 md:pl-8" : ""}`}
		>
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<div className="min-w-0">
					<h3 className="font-display text-lg font-semibold text-ink">
						{resume.name || "Untitled Resume"}
						{tailored ? (
							<span className="ml-2 align-middle font-mono text-xs font-normal text-accent">
								tailored
							</span>
						) : null}
					</h3>
					{label && (
						<p className="mt-1 font-mono text-xs text-ink-2">{label}</p>
					)}
				</div>
				{resume.paletteId && (
					<span className="shrink-0 font-mono text-xs text-ink-2">
						{resume.paletteId.replace("-", " ")}
					</span>
				)}
			</div>

			<p className="mt-2 text-sm text-ink-2">
				<Link
					href={`/r/${resume.slug}`}
					className="text-ink underline-offset-2 hover:text-accent hover:underline"
				>
					/r/{resume.slug}
				</Link>
				<span className="mx-2 text-rule" aria-hidden>
					·
				</span>
				Last saved {formatDate(resume.savedAt)}
			</p>

			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
				<Link
					href={`/create?edit=${resume.slug}`}
					className="text-ink underline-offset-2 hover:text-accent hover:underline"
				>
					Edit
				</Link>
				<Link
					href={`/create?edit=${resume.slug}&job=1`}
					className="text-ink-2 underline-offset-2 hover:text-accent hover:underline"
				>
					Tailor again
				</Link>
				<Link
					href={`/r/${resume.slug}`}
					className="text-ink-2 underline-offset-2 hover:text-accent hover:underline"
				>
					Resume
				</Link>
				{showPortfolio && (
					<Link
						href={`/p/${portfolioSlug}`}
						className="text-ink-2 underline-offset-2 hover:text-accent hover:underline"
					>
						Portfolio
					</Link>
				)}
				<button
					type="button"
					onClick={() => onDelete(resume.slug)}
					className="ml-auto text-ink-2 underline-offset-2 hover:text-red-600 hover:underline"
				>
					Delete
				</button>
			</div>
		</div>
	);
}
