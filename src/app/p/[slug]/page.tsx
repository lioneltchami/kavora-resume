import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PortfolioPage from "@/components/PortfolioPage";
import type {
	PortfolioProject,
	PortfolioSettings,
	PortfolioTestimonial,
} from "@/lib/portfolio-types";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ResumeData } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────── */
/*  Hardcoded example portfolio for "reena" demo slug                  */
/* ────────────────────────────────────────────────────────────────── */

const reenaPortfolioSettings = {
	user_id: "demo-reena-user", // Not a real UUID, just for demo
	slug: "reena",
	bio: "Customer service professional with 10+ years delivering exceptional support across financial services, telecommunications, retail, and hospitality. Bilingual in English and French. Passionate about building lasting client relationships and resolving complex concerns with empathy.",
	avatar_url: null,
	show_contact_form: true,
	show_testimonials: true,
	theme_color: "classic-navy",
	social_links: {
		linkedin: "https://linkedin.com",
	},
	created_at: new Date("2024-01-01").toISOString(),
	updated_at: new Date("2024-01-01").toISOString(),
} as PortfolioSettings;

const reenaPortfolioProjects = [
	{
		id: "proj1",
		user_id: "demo-reena-user",
		slug: "reena",
		title: "Client Service Excellence Initiative",
		description:
			"Led customer service transformation at Olympia Trust Company, managing 80+ daily interactions while maintaining high first-call resolution rates. Implemented process improvements that reduced escalations by 20% and improved client satisfaction scores.",
		category: "consulting" as const,
		image_url: null,
		live_url: null,
		display_order: 1,
		created_at: new Date("2024-01-10").toISOString(),
	},
	{
		id: "proj2",
		user_id: "demo-reena-user",
		slug: "reena",
		title: "Multilingual Support Program",
		description:
			"Developed and managed bilingual (English/French) customer support at ADT by TELUS. De-escalated sensitive concerns through empathetic communication and achieved 95% customer retention targets. Created documentation for complex technical issues in both languages.",
		category: "consulting" as const,
		image_url: null,
		live_url: null,
		display_order: 2,
		created_at: new Date("2024-01-10").toISOString(),
	},
	{
		id: "proj3",
		user_id: "demo-reena-user",
		slug: "reena",
		title: "Customer Retention Strategy",
		description:
			"Designed and executed retention campaigns that identified at-risk customers and delivered personalized solutions. Resolved billing disputes with professionalism and transparent communication, building long-term customer loyalty and trust.",
		category: "consulting" as const,
		image_url: null,
		live_url: null,
		display_order: 3,
		created_at: new Date("2024-01-10").toISOString(),
	},
] as PortfolioProject[];

const reenaPortfolioTestimonials = [
	{
		id: "test1",
		user_id: "demo-reena-user",
		name: "Sarah Johnson",
		role: "Manager",
		company: "Olympia Trust Company",
		avatar_url: null,
		text: "Reena's dedication to customer satisfaction is exceptional. She consistently goes above and beyond to resolve client concerns with professionalism and empathy. A true asset to any team.",
		display_order: 1,
		created_at: new Date("2024-01-15").toISOString(),
	},
	{
		id: "test2",
		user_id: "demo-reena-user",
		name: "Marcus Chen",
		role: "Team Lead",
		company: "ADT by TELUS",
		avatar_url: null,
		text: "Reena's bilingual skills and calm demeanor were invaluable in our customer retention team. She has a natural ability to turn upset customers into loyal advocates.",
		display_order: 2,
		created_at: new Date("2024-01-15").toISOString(),
	},
] as PortfolioTestimonial[];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PageProps {
	params: Promise<{ slug: string }>;
}

/* ------------------------------------------------------------------ */
/*  Data fetching helpers                                              */
/* ------------------------------------------------------------------ */

async function getPortfolioSettings(
	slug: string,
): Promise<PortfolioSettings | null> {
	// Hardcoded demo data
	if (slug === "reena") {
		return reenaPortfolioSettings;
	}

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("portfolio_settings")
		.select("*")
		.eq("slug", slug)
		.single();

	if (error || !data) return null;
	return data as PortfolioSettings;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Hardcoded reena resume data                                        */
/* ────────────────────────────────────────────────────────────────── */

// Check hardcoded reena demo first
	/* ────────────────────────────────────────────────────────────────── */
/*  Hardcoded reena resume data                                        */
/* ────────────────────────────────────────────────────────────────── */
const reenaData: ResumeData = {
	slug: "reena",
	name: "Reena Sumputh",
	location: "Calgary, AB",
	phone: "(403) 771-7615",
	email: "sumputhreena@yahoo.ca",
	summary: "Dedicated and customer-focused professional with over 10 years of experience delivering outstanding service across financial services, telecommunications, retail, and hospitality. Proven ability to resolve complex client concerns with empathy and efficiency while consistently exceeding satisfaction targets. Bilingual in English and French with exceptional interpersonal and communication skills. Adept at building lasting client relationships, thriving in high-volume environments, and contributing to cohesive, high-performing teams.",
	skills: ["Customer Relationship Management", "Conflict Resolution", "Bilingual (English & French)", "Inbound & Outbound Communication", "Client Retention Strategies", "Cash Handling & POS Systems", "Team Collaboration", "Multitasking & Time Management", "Data Entry & Documentation", "Inventory Management", "Microsoft Office Suite", "Empathetic Communication"],
	experience: [{id: "exp1", title: "Client Service Representative", company: "Olympia Trust Company", location: "Calgary, AB", startDate: "January 2022", endDate: "August 2023", bullets: ["Managed 80+ daily inbound calls, emails, and live chats while maintaining a professional and composed demeanor under pressure", "Resolved client inquiries and escalated concerns promptly, contributing to a high first-call resolution rate", "Guided clients through complex financial documentation and account processes, ensuring clarity and confidence", "Provided technical troubleshooting for online portals, reducing repeat contacts through thorough follow-up", "Proactively identified and escalated time-sensitive issues, safeguarding client trust and regulatory compliance"]}, {id: "exp2", title: "Bilingual Retention Agent", company: "ADT by TELUS", location: "Calgary, AB", startDate: "February 2020", endDate: "December 2021", bullets: ["Retained at-risk customers by identifying pain points and delivering tailored solutions, consistently meeting monthly retention targets", "Conducted empathetic conversations in English and French to de-escalate concerns and rebuild client loyalty", "Resolved sensitive billing disputes with professionalism, ensuring accurate account adjustments and transparent communication", "Maintained detailed records of client interactions in CRM systems to support seamless follow-up and reporting"]}, {id: "exp3", title: "Shelf Stocker", company: "Save-On-Foods", location: "Calgary, AB", startDate: "January 2017", endDate: "June 2017", bullets: ["Stocked, rotated, and organized merchandise across multiple departments, ensuring shelves were fully replenished and visually appealing", "Monitored product expiry dates and applied FIFO (First In, First Out) inventory practices to minimize waste", "Assisted customers with locating products and provided friendly, knowledgeable service on the sales floor", "Collaborated with team members to efficiently process incoming shipments and maintain backroom organization"]}, {id: "exp4", title: "Barista", company: "Starbucks", location: "Calgary, AB", startDate: "October 2015", endDate: "January 2016", bullets: ["Crafted high-quality espresso beverages and specialty drinks to brand standards in a fast-paced, high-traffic location", "Delivered warm, personalized customer experiences that encouraged repeat visits and positive feedback", "Processed cash and card transactions accurately using POS systems and balanced registers at end of shift", "Maintained a clean, organized workspace in compliance with health and safety standards"]}],
	education: [{id: "edu1", degree: "Office Administration Diploma", school: "Reeves College", location: "Calgary, AB"}, {id: "edu2", degree: "Certificate in Computer Applications", school: "Datamatics", location: "Mauritius"}, {id: "edu3", degree: "High School Diploma", school: "Patten College", location: "Mauritius"}],
	volunteer: ["YMCA Northern Alberta", "Canadian Mental Health Association", "St. Gabriel School"],
	languages: [{name: "English", level: "Fluent"}, {name: "French", level: "Fluent"}],
} as ResumeData;


async function getResumeData(slug: string): Promise<ResumeData | null> {
	if (slug === "reena") return reenaData;

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("resumes")
		.select("data")
		.eq("slug", slug)
		.single();

	if (error || !data) return null;
	return data.data as ResumeData;
}

async function getProjects(slug: string): Promise<PortfolioProject[]> {
	// Hardcoded demo data
	if (slug === "reena") {
		return reenaPortfolioProjects;
	}

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("portfolio_projects")
		.select("*")
		.eq("slug", slug)
		.order("display_order", { ascending: true });

	if (error || !data) return [];
	return data as PortfolioProject[];
}

async function getTestimonials(slug: string): Promise<PortfolioTestimonial[]> {
	// Hardcoded demo data
	if (slug === "reena") {
		return reenaPortfolioTestimonials;
	}

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("portfolio_testimonials")
		.select("*")
		.eq("slug", slug)
		.order("display_order", { ascending: true });

	if (error || !data) return [];
	return data as PortfolioTestimonial[];
}

function recordPageView(slug: string, userAgent: string, referrer: string) {
	try {
		const service = createServiceClient();
		service
			.from("portfolio_views")
			.insert({
				slug,
				user_agent: userAgent || null,
				referrer: referrer || null,
			})
			.then(() => {
				// fire and forget — intentionally not awaited
			});
	} catch {
		// Non-critical — silently ignore view tracking failures
	}
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const settings = await getPortfolioSettings(slug);

	if (!settings) {
		return { title: "Portfolio Not Found" };
	}

	const resume = await getResumeData(slug);
	const name = resume?.name ?? "Portfolio";
	const title = `${name} — Portfolio`;
	const description = settings.bio
		? settings.bio.slice(0, 160) + (settings.bio.length > 160 ? "..." : "")
		: `View ${name}'s professional portfolio`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "profile",
			siteName: "Kavora",
			images: [`/p/${slug}/og`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`/p/${slug}/og`],
		},
	};
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function PortfolioPageRoute({ params }: PageProps) {
	const { slug } = await params;

	const settings = await getPortfolioSettings(slug);
	if (!settings) {
		notFound();
	}

	const [resume, projects, testimonials] = await Promise.all([
		getResumeData(slug),
		getProjects(slug),
		settings.show_testimonials ? getTestimonials(slug) : Promise.resolve([]),
	]);

	if (!resume) {
		notFound();
	}

	// Record page view (fire and forget)
	const headerStore = await headers();
	const userAgent = headerStore.get("user-agent") ?? "";
	const referrer = headerStore.get("referer") ?? "";
	recordPageView(slug, userAgent, referrer);

	// Determine if the current user owns this portfolio
	let isOwner = false;
	if (resume.userId) {
		try {
			const supabase = await createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			isOwner = user?.id === resume.userId;
		} catch {
			// Auth check failed — treat as non-owner
		}
	}

	return (
		<PortfolioPage
			resume={resume}
			settings={settings}
			projects={projects}
			testimonials={testimonials}
			isOwner={isOwner}
			slug={slug}
		/>
	);
}
