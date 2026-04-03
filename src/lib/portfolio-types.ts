// Project category enum
export type ProjectCategory =
	| "design"
	| "development"
	| "marketing"
	| "writing"
	| "consulting"
	| "photography"
	| "other";

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
	{ value: "design", label: "Design" },
	{ value: "development", label: "Development" },
	{ value: "marketing", label: "Marketing" },
	{ value: "writing", label: "Writing" },
	{ value: "consulting", label: "Consulting" },
	{ value: "photography", label: "Photography" },
	{ value: "other", label: "Other" },
];

export interface PortfolioProject {
	id: string;
	user_id: string;
	slug: string; // portfolio slug (matches resume slug)
	title: string;
	description: string;
	category: ProjectCategory;
	image_url: string | null;
	live_url: string | null;
	display_order: number;
	created_at: string;
}

export interface PortfolioSocialLinks {
	linkedin?: string;
	github?: string;
	twitter?: string;
	website?: string;
}

export interface PortfolioSettings {
	user_id: string;
	slug: string;
	bio: string;
	avatar_url: string | null;
	show_contact_form: boolean;
	show_testimonials: boolean;
	theme_color: string; // matches palette IDs from PALETTES: 'classic-navy', 'modern-teal', etc.
	social_links: PortfolioSocialLinks;
	created_at: string;
	updated_at: string;
}

export interface PortfolioTestimonial {
	id: string;
	user_id: string;
	name: string;
	role: string;
	company: string;
	avatar_url: string | null;
	text: string;
	display_order: number;
	created_at: string;
}

export interface PortfolioView {
	id: string;
	slug: string;
	viewed_at: string;
	user_agent: string | null;
	referrer: string | null;
}

export interface PortfolioData {
	settings: PortfolioSettings;
	projects: PortfolioProject[];
	testimonials: PortfolioTestimonial[];
	// resume data (name, summary, experience, skills etc.) is merged in from resumes table
}

export const emptyPortfolioSettings: PortfolioSettings = {
	user_id: "",
	slug: "",
	bio: "",
	avatar_url: null,
	show_contact_form: false,
	show_testimonials: false,
	theme_color: "classic-navy",
	social_links: {},
	created_at: "",
	updated_at: "",
};

export const emptyPortfolioProject: Omit<
	PortfolioProject,
	"id" | "user_id" | "created_at"
> = {
	slug: "",
	title: "",
	description: "",
	category: "other",
	image_url: null,
	live_url: null,
	display_order: 0,
};
