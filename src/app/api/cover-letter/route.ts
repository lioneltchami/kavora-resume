import { type NextRequest, NextResponse } from "next/server";
import { checkUserPro } from "@/lib/check-pro";
import type { ResumeData } from "@/lib/types";

// Simple in-memory rate limiter (per IP, 10 requests per minute)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Claude API call                                                    */
/* ------------------------------------------------------------------ */

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
      max_tokens: 1500,
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

/* ------------------------------------------------------------------ */
/*  Fallback cover letter (no API key)                                 */
/* ------------------------------------------------------------------ */

function buildFallbackCoverLetter(
  resumeData: ResumeData,
  jobDescription: string,
  companyName: string,
): string {
  const recentJob = resumeData.experience[0];
  const recentTitle = recentJob?.title || "professional";
  const recentCompany = recentJob?.company || "";
  const skills = resumeData.skills.slice(0, 5).join(", ");
  const topBullets =
    recentJob?.bullets?.filter((b) => b.trim()).slice(0, 2) || [];

  // Extract a keyword from the job description for personalization
  const jdLower = jobDescription.toLowerCase();
  let roleType = "this position";
  if (/engineer|develop|software/i.test(jdLower))
    roleType = "this engineering role";
  else if (/market|growth|brand/i.test(jdLower))
    roleType = "this marketing role";
  else if (/design|ux|ui/i.test(jdLower)) roleType = "this design role";
  else if (/manager|director|lead/i.test(jdLower))
    roleType = "this leadership role";
  else if (/analyst|data|research/i.test(jdLower))
    roleType = "this analyst role";

  const paragraphs: string[] = [];

  // Opening paragraph
  paragraphs.push(
    `Throughout my career as a ${recentTitle}${recentCompany ? ` at ${recentCompany}` : ""}, I have developed a deep expertise in ${skills || "delivering impactful results"}. When I came across ${roleType} at ${companyName}, I recognized an exceptional opportunity to bring my experience to a team that values innovation and excellence.`,
  );

  // Achievement paragraph
  if (topBullets.length > 0) {
    const bulletText = topBullets
      .map((b) => b.replace(/^[-•*]\s*/, "").trim())
      .join(". Additionally, I ");
    paragraphs.push(
      `In my most recent role, I ${bulletText.charAt(0).toLowerCase() + bulletText.slice(1)}. These accomplishments reflect my commitment to driving measurable outcomes and my ability to thrive in demanding environments.`,
    );
  } else {
    paragraphs.push(
      `Over the course of my career, I have consistently delivered results that exceed expectations. My background in ${skills || "cross-functional collaboration and problem-solving"} has equipped me to tackle complex challenges and contribute meaningfully from day one.`,
    );
  }

  // Skills + enthusiasm paragraph
  paragraphs.push(
    `What excites me most about ${companyName} is the opportunity to contribute to a team that is shaping the future of its industry. My proficiency in ${skills || "key areas relevant to this role"}, combined with a track record of cross-functional collaboration, positions me to make an immediate and lasting impact.`,
  );

  // Closing paragraph
  paragraphs.push(
    `I would welcome the chance to discuss how my background and skills align with ${companyName}'s goals. I am available at your convenience for a conversation and look forward to exploring how I can contribute to your team's continued success.`,
  );

  return paragraphs.join("\n\n");
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                      */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const { isPro } = await checkUserPro();
  if (!isPro) {
    return NextResponse.json(
      { error: "Pro feature", code: "PRO_REQUIRED" },
      { status: 403 },
    );
  }

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

  try {
    const body = await req.json();
    const { resumeData, jobDescription, companyName, hiringManager } = body as {
      resumeData: ResumeData;
      jobDescription: string;
      companyName: string;
      hiringManager?: string;
    };

    if (!resumeData || !jobDescription || !companyName) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: resumeData, jobDescription, companyName",
        },
        { status: 400 },
      );
    }

    const recentJob = resumeData.experience[0];
    const recentTitle = recentJob?.title || "professional";
    const skillsList = resumeData.skills.join(", ");

    const prompt = `Write a professional cover letter for the following person applying to a role.

APPLICANT:
Name: ${resumeData.name}
Current/Recent Title: ${recentTitle}
Key Skills: ${skillsList}
Experience Summary: ${resumeData.summary}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}
${hiringManager ? `HIRING MANAGER: ${hiringManager}` : ""}

Write a compelling, personalized cover letter that:
- Opens with a strong hook connecting the applicant's experience to the role
- Highlights 2-3 specific achievements from their experience that match the job requirements
- Shows enthusiasm for the company and role
- Closes with a confident call to action
- Is 3-4 paragraphs long
- Uses a professional but warm tone
- Does NOT use clichés like "I am writing to express my interest" or "I believe I would be a great fit"

Return ONLY the cover letter text, no greeting or signature (the app will add those).`;

    try {
      const coverLetter = await callClaude(prompt);
      return NextResponse.json({ coverLetter });
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "NO_API_KEY") {
        const coverLetter = buildFallbackCoverLetter(
          resumeData,
          jobDescription,
          companyName,
        );
        return NextResponse.json({ coverLetter });
      }
      throw e;
    }
  } catch (error) {
    console.error("Cover letter API error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
