import { type NextRequest, NextResponse } from "next/server";
import { pdfToText } from "pdf-ts";
import type { ResumeData } from "@/lib/types";
import { createId } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Allow up to 30s for AI extraction

// Rate limiting (5 per minute per IP)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimit.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
		return true;
	}
	if (entry.count >= 5) return false;
	entry.count++;
	return true;
}

export async function POST(req: NextRequest) {
	const ip =
		req.headers.get("x-forwarded-for") ||
		req.headers.get("x-real-ip") ||
		"unknown";
	if (!checkRateLimit(ip)) {
		return NextResponse.json(
			{ error: "Too many requests. Please wait." },
			{ status: 429 },
		);
	}

	try {
		const formData = await req.formData();
		const file = formData.get("pdf") as File | null;

		if (!file || !file.name.endsWith(".pdf")) {
			return NextResponse.json(
				{ error: "Please upload a PDF file" },
				{ status: 400 },
			);
		}

		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "File must be under 5MB" },
				{ status: 400 },
			);
		}

		// Extract text from PDF
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		const pdfText = await pdfToText(uint8Array);

		if (!pdfText || pdfText.trim().length < 50) {
			return NextResponse.json(
				{
					error:
						"Could not extract text from PDF. Try pasting the text instead.",
				},
				{ status: 400 },
			);
		}

		// Use AI to extract structured resume data
		const resumeData = await extractWithAI(pdfText);

		return NextResponse.json({ data: resumeData });
	} catch (err) {
		console.error("PDF extraction error:", err);
		return NextResponse.json(
			{ error: "Failed to process PDF" },
			{ status: 500 },
		);
	}
}

async function extractWithAI(text: string): Promise<Partial<ResumeData>> {
	const apiKey = process.env.ANTHROPIC_API_KEY;

	const prompt = `Extract structured resume data from the following text. Return a JSON object with these exact fields:

{
  "name": "Full Name",
  "location": "City, State/Province",
  "phone": "Phone number",
  "email": "Email address",
  "summary": "Professional summary (3-4 sentences, write one if not present)",
  "skills": ["skill1", "skill2", ...],  // max 12 skills
  "experience": [
    {
      "id": "unique_id",
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": ["Achievement 1", "Achievement 2", ...]
    }
  ],
  "education": [
    {
      "id": "unique_id",
      "degree": "Degree Name",
      "school": "School Name",
      "location": "City, State"
    }
  ],
  "volunteer": ["Organization 1", "Organization 2"],
  "languages": [{ "name": "English", "level": "Fluent" }]
}

IMPORTANT RULES:
- Generate unique IDs for each experience and education entry (8 random chars)
- Extract ALL work experience entries, ordered most recent first
- For each job, extract or write 3-5 achievement-oriented bullet points with strong action verbs
- If the summary is missing or weak, write a strong professional summary based on the person's experience
- Extract skills from both explicit skills sections and from job descriptions
- Cap skills at 12 most relevant ones
- Return ONLY the JSON object, no markdown, no commentary

RESUME TEXT:
${text.slice(0, 8000)}`;

	if (!apiKey) {
		// Fallback: basic text parsing without AI
		return parseBasicText(text);
	}

	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 4096,
			messages: [{ role: "user", content: prompt }],
		}),
	});

	if (!response.ok) {
		throw new Error(`AI extraction failed: ${response.status}`);
	}

	const result = await response.json();
	const content = result.content?.[0]?.text || "";

	// Parse JSON from response (handle potential markdown wrapping)
	const jsonMatch = content.match(/\{[\s\S]*\}/);
	if (!jsonMatch) throw new Error("AI did not return valid JSON");

	const parsed = JSON.parse(jsonMatch[0]);

	// Ensure IDs exist
	if (parsed.experience) {
		parsed.experience = parsed.experience.map((e: any) => ({
			...e,
			id: e.id || createId(),
		}));
	}
	if (parsed.education) {
		parsed.education = parsed.education.map((e: any) => ({
			...e,
			id: e.id || createId(),
		}));
	}

	return parsed;
}

// Basic fallback parser when no API key
function parseBasicText(text: string): Partial<ResumeData> {
	const lines = text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
	const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
	const phoneMatch = text.match(
		/[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/,
	);

	return {
		name: lines[0]?.length < 50 ? lines[0] : "",
		email: emailMatch?.[0] || "",
		phone: phoneMatch?.[0] || "",
		location: "",
		summary: "",
		skills: [],
		experience: [],
		education: [],
		volunteer: [],
		languages: [],
	};
}
