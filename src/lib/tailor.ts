import type { ExperienceEntry, ResumeData } from "./types";

export const FREE_TAILOR_LIMIT = 1;
export const TAILOR_JD_MAX_CHARS = 8000;

export interface TailorExperiencePatch {
	id: string;
	bullets: string[];
}

export interface TailorPatch {
	summary?: string;
	skills?: string[];
	experience?: TailorExperiencePatch[];
	label?: string;
	targetCompany?: string;
	targetRole?: string;
}

export function buildTailorLabel(input: {
	company?: string | null;
	role?: string | null;
}): string {
	const company = (input.company ?? "").trim();
	const role = (input.role ?? "").trim();
	if (company && role) return `${company} — ${role}`;
	if (company) return company;
	if (role) return role;
	return "Tailored resume";
}

export function canUseFreeTailor(input: { isPro: boolean; used: number }): {
	allowed: boolean;
	remaining: number | null;
} {
	if (input.isPro) return { allowed: true, remaining: null };
	const remaining = Math.max(0, FREE_TAILOR_LIMIT - input.used);
	return { allowed: remaining > 0, remaining };
}

export function applyTailorPatch(
	resume: ResumeData,
	patch: TailorPatch,
	now: Date = new Date(),
): ResumeData {
	const bulletMap = new Map(
		(patch.experience ?? []).map((entry) => [entry.id, entry.bullets] as const),
	);

	const experience: ExperienceEntry[] = resume.experience.map((job) => {
		const bullets = bulletMap.get(job.id);
		if (!bullets) return job;
		return {
			...job,
			bullets: bullets.map((b) => b.trim()).filter(Boolean),
		};
	});

	return {
		...resume,
		summary: patch.summary?.trim() || resume.summary,
		skills:
			patch.skills && patch.skills.length > 0
				? patch.skills.map((s) => s.trim()).filter(Boolean)
				: resume.skills,
		experience,
		label: patch.label?.trim() || resume.label,
		targetCompany: patch.targetCompany?.trim() || resume.targetCompany,
		targetRole: patch.targetRole?.trim() || resume.targetRole,
		tailoredAt: now.toISOString(),
	};
}

function extractKeywords(jobDescription: string, limit = 8): string[] {
	const stop = new Set([
		"and",
		"the",
		"for",
		"with",
		"you",
		"will",
		"our",
		"are",
		"this",
		"that",
		"from",
		"have",
		"your",
		"role",
		"team",
		"work",
		"ability",
		"experience",
		"looking",
		"about",
		"into",
		"using",
	]);

	const counts = new Map<string, number>();
	for (const raw of jobDescription
		.toLowerCase()
		.match(/[a-z][a-z0-9+#.]{2,}/g) ?? []) {
		if (stop.has(raw)) continue;
		counts.set(raw, (counts.get(raw) ?? 0) + 1);
	}

	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([word]) => word.replace(/^\w/, (c) => c.toUpperCase()));
}

export function buildFallbackTailorPatch(input: {
	resume: ResumeData;
	company: string;
	role?: string;
	jobDescription: string;
}): TailorPatch {
	const company = input.company.trim() || "the company";
	const role = (input.role ?? "").trim();
	const keywords = extractKeywords(input.jobDescription);
	const keywordPhrase =
		keywords.length > 0
			? keywords.slice(0, 4).join(", ")
			: "the core requirements";

	const summary = [
		`Results-driven professional targeting ${role || "this role"} at ${company}.`,
		`Brings hands-on experience in ${input.resume.skills.slice(0, 4).join(", ") || "cross-functional delivery"}`,
		`and aligns recent impact with ${keywordPhrase}.`,
	].join(" ");

	const experience = input.resume.experience.map((job) => ({
		id: job.id,
		bullets: [
			...job.bullets
				.slice(0, 2)
				.map((b) => b.trim())
				.filter(Boolean),
			`Applied ${keywords[0] ?? "process"} expertise to improve outcomes for ${company}-style stakeholders`,
		].slice(0, 5),
	}));

	const skills = Array.from(
		new Set([...keywords.slice(0, 5), ...input.resume.skills]),
	).slice(0, 12);

	return {
		summary,
		skills,
		experience,
		label: buildTailorLabel({ company: input.company, role }),
		targetCompany: input.company.trim() || undefined,
		targetRole: role || undefined,
	};
}

export function parseTailorModelJson(raw: string): TailorPatch | null {
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;

	try {
		const parsed = JSON.parse(raw.slice(start, end + 1)) as TailorPatch;
		if (!parsed || typeof parsed !== "object") return null;
		return {
			summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
			skills: Array.isArray(parsed.skills)
				? parsed.skills.filter((s): s is string => typeof s === "string")
				: undefined,
			experience: Array.isArray(parsed.experience)
				? parsed.experience
						.filter(
							(e): e is TailorExperiencePatch =>
								!!e &&
								typeof e === "object" &&
								typeof (e as TailorExperiencePatch).id === "string" &&
								Array.isArray((e as TailorExperiencePatch).bullets),
						)
						.map((e) => ({
							id: e.id,
							bullets: e.bullets.filter(
								(b): b is string => typeof b === "string",
							),
						}))
				: undefined,
		};
	} catch {
		return null;
	}
}
