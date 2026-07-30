import { type NextRequest, NextResponse } from "next/server";
import { checkUserPro } from "@/lib/check-pro";
import { createClient } from "@/lib/supabase/server";
import {
	buildFallbackTailorPatch,
	buildTailorLabel,
	canUseFreeTailor,
	FREE_TAILOR_LIMIT,
	parseTailorModelJson,
	TAILOR_JD_MAX_CHARS,
	type TailorPatch,
} from "@/lib/tailor";
import type { ResumeData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimit.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
		return true;
	}
	if (entry.count >= 8) return false;
	entry.count++;
	return true;
}

async function callClaude(prompt: string): Promise<string> {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) throw new Error("NO_API_KEY");

	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 2000,
			messages: [{ role: "user", content: prompt }],
		}),
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Anthropic API error ${response.status}: ${err}`);
	}

	const data = await response.json();
	const text: string =
		data.content?.[0]?.type === "text" ? data.content[0].text : "";
	return text.trim();
}

function buildPrompt(input: {
	resume: ResumeData;
	company: string;
	role?: string;
	jobDescription: string;
}): string {
	const experience = input.resume.experience
		.map(
			(job) =>
				`- id=${job.id} | ${job.title} at ${job.company} (${job.startDate}–${job.endDate})\n  bullets:\n${job.bullets.map((b) => `  * ${b}`).join("\n")}`,
		)
		.join("\n");

	return `You are an expert resume writer. Tailor this resume for a specific job WITHOUT inventing employers, titles, dates, or fake achievements.

COMPANY: ${input.company}
TARGET ROLE: ${input.role || "not specified"}
JOB DESCRIPTION:
${input.jobDescription}

CURRENT RESUME:
Name: ${input.resume.name}
Summary: ${input.resume.summary}
Skills: ${input.resume.skills.join(", ")}
Experience:
${experience}

Return ONLY valid JSON with this shape:
{
  "summary": "rewritten summary paragraph",
  "skills": ["skill1", "skill2"],
  "experience": [{ "id": "existing-id", "bullets": ["rewritten bullet"] }]
}

Rules:
- Only use experience ids that already exist
- Keep facts truthful; rephrase and prioritize relevance
- Prefer 3-5 bullets per role
- Include job-relevant keywords naturally
- No markdown, no commentary`;
}

export async function POST(req: NextRequest) {
	const ip =
		req.headers.get("x-forwarded-for") ||
		req.headers.get("x-real-ip") ||
		"unknown";
	if (!checkRateLimit(ip)) {
		return NextResponse.json(
			{ error: "Too many requests. Please wait a moment." },
			{ status: 429 },
		);
	}

	const { isPro, userId } = await checkUserPro();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = await createClient();
	let currentUsed = 0;

	if (!isPro) {
		const { data: profile } = await supabase
			.from("profiles")
			.select("tailor_used")
			.eq("user_id", userId)
			.single();
		currentUsed = profile?.tailor_used ?? 0;
		const gate = canUseFreeTailor({ isPro: false, used: currentUsed });
		if (!gate.allowed) {
			return NextResponse.json(
				{
					error: "Free tailor limit reached",
					code: "PRO_REQUIRED",
					used: currentUsed,
					limit: FREE_TAILOR_LIMIT,
				},
				{ status: 403 },
			);
		}
	}

	try {
		const body = await req.json();
		const resumeData = body.resumeData as ResumeData | undefined;
		const jobDescription = String(body.jobDescription ?? "").trim();
		const companyName = String(body.companyName ?? "").trim();
		const targetRole = String(body.targetRole ?? "").trim();

		if (!resumeData || !jobDescription || !companyName) {
			return NextResponse.json(
				{
					error:
						"Missing required fields: resumeData, jobDescription, companyName",
				},
				{ status: 400 },
			);
		}

		if (jobDescription.length > TAILOR_JD_MAX_CHARS) {
			return NextResponse.json(
				{
					error: `Job description must be under ${TAILOR_JD_MAX_CHARS} characters`,
				},
				{ status: 400 },
			);
		}

		let patch: TailorPatch;
		let fallback = false;

		try {
			const raw = await callClaude(
				buildPrompt({
					resume: resumeData,
					company: companyName,
					role: targetRole || undefined,
					jobDescription,
				}),
			);
			const parsed = parseTailorModelJson(raw);
			if (!parsed?.summary && !parsed?.experience?.length) {
				throw new Error("Empty tailor response");
			}
			patch = {
				...parsed,
				label: buildTailorLabel({ company: companyName, role: targetRole }),
				targetCompany: companyName,
				targetRole: targetRole || undefined,
			};
		} catch (err) {
			console.error("Tailor Claude failed, using fallback:", err);
			fallback = true;
			patch = buildFallbackTailorPatch({
				resume: resumeData,
				company: companyName,
				role: targetRole || undefined,
				jobDescription,
			});
		}

		let remaining: number | null = null;
		if (!isPro) {
			const newUsed = currentUsed + 1;
			remaining = Math.max(0, FREE_TAILOR_LIMIT - newUsed);
			await supabase
				.from("profiles")
				.upsert(
					{ user_id: userId, tailor_used: newUsed },
					{ onConflict: "user_id" },
				);
		}

		return NextResponse.json({
			patch,
			label: patch.label,
			remaining,
			fallback,
		});
	} catch (err) {
		console.error("POST /api/tailor error:", err);
		return NextResponse.json(
			{ error: "Failed to tailor resume" },
			{ status: 500 },
		);
	}
}
