export interface Palette {
  id: string;
  name: string;
  primary: string; // Section titles, name color, header elements
  accent: string; // Lines, company names, skill tag borders, decorative elements
  headerBg: string; // Dark section background (web view footer, skill tag bg)
}

export const PALETTES: Palette[] = [
  {
    id: "classic-navy",
    name: "Classic Navy",
    primary: "#1e2a3a",
    accent: "#b08d57",
    headerBg: "#1e2a3a",
  },
  {
    id: "modern-teal",
    name: "Modern Teal",
    primary: "#0d7377",
    accent: "#e8a87c",
    headerBg: "#0a5c5f",
  },
  {
    id: "warm-burgundy",
    name: "Warm Burgundy",
    primary: "#722f37",
    accent: "#c9a96e",
    headerBg: "#5a252c",
  },
  {
    id: "minimal-gray",
    name: "Minimal Gray",
    primary: "#333333",
    accent: "#888888",
    headerBg: "#2a2a2a",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#2d4a3e",
    accent: "#a8c090",
    headerBg: "#243d33",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    primary: "#3b2d5e",
    accent: "#c4a1d9",
    headerBg: "#312650",
  },
];

export function getPalette(id?: string): Palette {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
}

export const LAYOUTS: LayoutTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional single-column layout",
  },
  { id: "modern", name: "Modern", description: "Clean with accent sidebar" },
  { id: "compact", name: "Compact", description: "Space-efficient two-column" },
  {
    id: "executive",
    name: "Executive",
    description: "Bold headers, premium feel",
  },
];

export function getLayout(id?: string): LayoutTemplate {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  location: string;
}

export interface ResumeData {
  slug: string;
  photo?: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  volunteer: string[];
  languages: { name: string; level: string }[];
  paletteId?: string;
  layoutId?: string;
  isPro?: boolean;
  paidAt?: string;
  userId?: string;
  isPublic?: boolean; // true = anyone can view, false = only owner can view
}

export const emptyResume: ResumeData = {
  slug: "",
  name: "",
  location: "",
  phone: "",
  email: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  volunteer: [],
  languages: [],
  paletteId: "",
  layoutId: "",
};

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}
