import { NextRequest, NextResponse } from "next/server";

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
/*  Fallback templates (used when ANTHROPIC_API_KEY is not configured) */
/* ------------------------------------------------------------------ */

const FALLBACK_SUMMARIES: Record<string, string> = {
  engineering:
    "Results-driven software engineer with a proven track record of designing, developing, and deploying scalable applications that serve millions of users. Adept at translating complex business requirements into elegant technical solutions while maintaining high standards for code quality and test coverage. Recognized for strong cross-functional collaboration with product, design, and data teams to deliver features that measurably improve key business metrics. Passionate about mentoring junior developers, championing engineering best practices, and continuously evaluating emerging technologies to keep the stack modern and performant.",
  marketing:
    "Strategic marketing professional with deep expertise in brand positioning, digital campaign management, and data-driven audience engagement. Skilled at orchestrating multi-channel campaigns — from paid search and social media to email and content marketing — that consistently exceed ROI targets. Proven ability to translate market research and customer insights into compelling narratives that strengthen brand loyalty and accelerate pipeline growth. A collaborative leader who thrives in fast-paced environments and brings a test-and-learn mindset to every initiative.",
  design:
    "Creative and detail-oriented UX/UI designer with extensive experience crafting intuitive digital experiences across web and mobile platforms. Combines user research, interaction design, and visual storytelling to deliver products that delight users while meeting business objectives. Proficient in leading design sprints, building design systems, and conducting usability testing that drives measurable improvements in task completion and user satisfaction. Known for bridging the gap between design and engineering through clear documentation and close partnership with development teams.",
  management:
    "Accomplished operations and project management professional with a strong background in leading cross-functional teams, optimizing workflows, and delivering complex initiatives on time and within budget. Expert at identifying process bottlenecks, implementing scalable solutions, and fostering a culture of continuous improvement. Demonstrated success in stakeholder management, resource allocation, and risk mitigation across both agile and traditional project methodologies. Committed to building high-performing teams through transparent communication, clear goal-setting, and professional development.",
  default:
    "Dedicated and versatile professional with a strong foundation in problem-solving, team collaboration, and delivering high-quality results in dynamic environments. Experienced in managing multiple priorities, adapting quickly to new challenges, and driving projects from concept through successful completion. Recognized for clear communication, analytical thinking, and a proactive approach to identifying opportunities for improvement. Eager to leverage a diverse skill set and growth mindset to make a meaningful contribution to a forward-thinking organization.",
};

function pickFallbackSummary(context: {
  name?: string;
  title?: string;
  skills?: string[];
}): string {
  const blob = `${context.title ?? ""} ${(context.skills ?? []).join(" ")}`.toLowerCase();

  if (/engineer|develop|software|fullstack|backend|frontend|devops|sre|data engineer|platform/i.test(blob)) {
    return FALLBACK_SUMMARIES.engineering;
  }
  if (/market|growth|seo|brand|content|social media|campaign|copywrite/i.test(blob)) {
    return FALLBACK_SUMMARIES.marketing;
  }
  if (/design|ux|ui|figma|sketch|product design|graphic|visual/i.test(blob)) {
    return FALLBACK_SUMMARIES.design;
  }
  if (/manager|director|lead|vp|head of|operations|project manage|program manage|scrum/i.test(blob)) {
    return FALLBACK_SUMMARIES.management;
  }
  return FALLBACK_SUMMARIES.default;
}

function pickFallbackBullets(context: {
  title?: string;
  company?: string;
}): string[] {
  const title = (context.title ?? "").toLowerCase();

  if (/engineer|develop|software|fullstack|backend|frontend/i.test(title)) {
    return [
      "Architected and implemented a microservices-based platform that reduced deployment times by 40% and improved system reliability to 99.95% uptime",
      "Led the migration of a legacy monolith to a modern React/TypeScript frontend, improving page load performance by 60% and boosting user engagement metrics by 25%",
      "Designed and built a CI/CD pipeline with automated testing and canary deployments, cutting production incidents by 35% quarter-over-quarter",
      "Mentored a team of 4 junior engineers through code reviews, pair programming sessions, and structured learning plans, resulting in 2 promotions within 12 months",
      "Collaborated with product and design stakeholders to scope, estimate, and deliver 15+ features per quarter while maintaining zero critical-severity regressions",
    ];
  }
  if (/market|growth|seo|brand|content/i.test(title)) {
    return [
      "Developed and executed an integrated digital marketing strategy that grew organic traffic by 120% and generated $2.4M in attributable pipeline within 6 months",
      "Managed a $500K annual paid media budget across Google Ads, LinkedIn, and Meta, achieving a blended ROAS of 5.2x through continuous A/B testing and bid optimization",
      "Launched a thought-leadership content program producing 3 long-form articles per week, increasing newsletter subscribers by 8,000 and improving domain authority by 15 points",
      "Spearheaded a brand refresh initiative including visual identity, messaging framework, and style guide adopted across all customer-facing channels",
      "Built and maintained a marketing analytics dashboard in Looker, enabling real-time campaign performance tracking and reducing reporting turnaround from 5 days to same-day",
    ];
  }
  if (/design|ux|ui/i.test(title)) {
    return [
      "Redesigned the end-to-end onboarding flow, increasing new-user activation rate from 32% to 58% based on A/B testing with 10,000+ participants",
      "Created and maintained a comprehensive design system with 80+ reusable components, reducing design-to-development handoff time by 50%",
      "Conducted 40+ moderated usability studies and synthesized findings into actionable recommendations that directly informed the product roadmap",
      "Partnered with engineering to implement responsive designs across web and mobile, ensuring WCAG 2.1 AA accessibility compliance on all core user flows",
      "Led design sprints for 3 new product features from discovery through launch, each meeting or exceeding target adoption metrics within the first quarter",
    ];
  }
  if (/manager|director|lead|vp|head of/i.test(title)) {
    return [
      "Directed a cross-functional team of 12 across engineering, design, and QA to deliver a flagship product launch that generated $3.5M in first-year revenue",
      "Implemented OKR-based goal setting and weekly sprint retrospectives, improving team velocity by 30% and on-time delivery rate from 72% to 94%",
      "Negotiated and managed vendor contracts totaling $1.2M annually, achieving 18% cost savings through strategic consolidation and competitive bidding",
      "Developed a structured hiring and onboarding program that reduced time-to-productivity for new hires from 8 weeks to 4 weeks",
      "Established quarterly business reviews with executive stakeholders, improving cross-departmental alignment and reducing duplicated initiatives by 40%",
    ];
  }
  // Generic fallback
  return [
    "Streamlined key operational workflows that reduced average task completion time by 30%, directly improving team productivity and client satisfaction scores",
    "Collaborated with cross-functional stakeholders to plan and execute projects valued at over $500K, consistently delivering on time and within budget",
    "Analyzed performance data to identify trends and opportunities, presenting actionable recommendations to leadership that informed strategic planning",
    "Trained and onboarded 10+ new team members, creating documentation and standard operating procedures that decreased ramp-up time by 40%",
    "Drove process improvement initiatives that eliminated redundant steps, saving an estimated 15 hours per week across the department",
  ];
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
      max_tokens: 1024,
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
/*  Route handler                                                      */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { field, context } = body as {
      field: "summary" | "bullets";
      context: {
        name?: string;
        title?: string;
        company?: string;
        existingBullets?: string[];
        skills?: string[];
      };
    };

    if (!field || !context) {
      return NextResponse.json(
        { error: "Missing required fields: field, context" },
        { status: 400 },
      );
    }

    /* ----- Summary ----- */
    if (field === "summary") {
      const skillsList = (context.skills ?? []).join(", ");
      const titles = context.title ?? "professional";

      const prompt = `You are a professional resume writer. Write a 3-4 sentence professional summary for a resume. The person's name is "${context.name || "the candidate"}". Their job title is "${titles}".${skillsList ? ` Their key skills include: ${skillsList}.` : ""}

Requirements:
- Write in third person implied (no "I" or name — start with a descriptor like "Results-driven…")
- Use ATS-optimized power words (e.g., "spearheaded", "orchestrated", "delivered", "optimized")
- Keep it between 50 and 80 words
- Do NOT use markdown, bullet points, or any formatting — just plain text as a single paragraph
- Do NOT add any commentary, preamble, or explanation — return ONLY the summary paragraph`;

      try {
        const suggestion = await callClaude(prompt);
        return NextResponse.json({ suggestion });
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NO_API_KEY") {
          const suggestion = pickFallbackSummary(context);
          return NextResponse.json({ suggestion });
        }
        throw e;
      }
    }

    /* ----- Bullets ----- */
    if (field === "bullets") {
      const existing =
        (context.existingBullets ?? []).filter((b) => b.trim()).join("\n- ") || "none";

      const prompt = `You are a professional resume writer. Generate exactly 5 professional bullet points for a resume.

Role: "${context.title || "Professional"}" at "${context.company || "a company"}"
${context.skills?.length ? `Key skills: ${context.skills.join(", ")}` : ""}
Existing bullets (avoid repeating these): ${existing}

Requirements:
- Start each bullet with a strong action verb (e.g., Spearheaded, Architected, Delivered, Optimized, Streamlined)
- Quantify impact with numbers, percentages, or dollar amounts where possible
- Keep each bullet to 1-2 lines (15-25 words)
- Make them ATS-friendly with relevant industry keywords
- Return ONLY the bullet text, one per line
- Do NOT number them or use bullet point characters — just plain text, one accomplishment per line
- Do NOT add any commentary, preamble, or explanation`;

      try {
        const raw = await callClaude(prompt);
        const suggestions = raw
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter((line) => line.length > 0);
        return NextResponse.json({ suggestions });
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NO_API_KEY") {
          const suggestions = pickFallbackBullets(context);
          return NextResponse.json({ suggestions });
        }
        throw e;
      }
    }

    return NextResponse.json({ error: "Invalid field value" }, { status: 400 });
  } catch (error) {
    console.error("Suggest API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 },
    );
  }
}
