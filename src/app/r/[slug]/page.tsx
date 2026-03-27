import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ResumeData } from "@/lib/types";
import ResumeWeb from "@/components/ResumeWeb";

/* ------------------------------------------------------------------ */
/*  Hardcoded example resume so /r/reena works without Supabase       */
/* ------------------------------------------------------------------ */

const reenaData: ResumeData = {
  slug: "reena",
  name: "Reena Sumputh",
  location: "Calgary, AB",
  phone: "(403) 771-7615",
  email: "sumputhreena@yahoo.ca",
  summary:
    "Dedicated and customer-focused professional with over 10 years of experience delivering outstanding service across financial services, telecommunications, retail, and hospitality. Proven ability to resolve complex client concerns with empathy and efficiency while consistently exceeding satisfaction targets. Bilingual in English and French with exceptional interpersonal and communication skills. Adept at building lasting client relationships, thriving in high-volume environments, and contributing to cohesive, high-performing teams.",
  skills: [
    "Customer Relationship Management",
    "Conflict Resolution",
    "Bilingual (English & French)",
    "Inbound & Outbound Communication",
    "Client Retention Strategies",
    "Cash Handling & POS Systems",
    "Team Collaboration",
    "Multitasking & Time Management",
    "Data Entry & Documentation",
    "Inventory Management",
    "Microsoft Office Suite",
    "Empathetic Communication",
  ],
  experience: [
    {
      id: "exp1",
      title: "Client Service Representative",
      company: "Olympia Trust Company",
      location: "Calgary, AB",
      startDate: "January 2022",
      endDate: "August 2023",
      bullets: [
        "Managed 80+ daily inbound calls, emails, and live chats while maintaining a professional and composed demeanor under pressure",
        "Resolved client inquiries and escalated concerns promptly, contributing to a high first-call resolution rate",
        "Guided clients through complex financial documentation and account processes, ensuring clarity and confidence",
        "Provided technical troubleshooting for online portals, reducing repeat contacts through thorough follow-up",
        "Proactively identified and escalated time-sensitive issues, safeguarding client trust and regulatory compliance",
      ],
    },
    {
      id: "exp2",
      title: "Bilingual Retention Agent",
      company: "ADT by TELUS",
      location: "Calgary, AB",
      startDate: "February 2020",
      endDate: "December 2021",
      bullets: [
        "Retained at-risk customers by identifying pain points and delivering tailored solutions, consistently meeting monthly retention targets",
        "Conducted empathetic conversations in English and French to de-escalate concerns and rebuild client loyalty",
        "Resolved sensitive billing disputes with professionalism, ensuring accurate account adjustments and transparent communication",
        "Maintained detailed records of client interactions in CRM systems to support seamless follow-up and reporting",
      ],
    },
    {
      id: "exp3",
      title: "Shelf Stocker",
      company: "Save-On-Foods",
      location: "Calgary, AB",
      startDate: "January 2017",
      endDate: "June 2017",
      bullets: [
        "Stocked, rotated, and organized merchandise across multiple departments, ensuring shelves were fully replenished and visually appealing",
        "Monitored product expiry dates and applied FIFO (First In, First Out) inventory practices to minimize waste",
        "Assisted customers with locating products and provided friendly, knowledgeable service on the sales floor",
        "Collaborated with team members to efficiently process incoming shipments and maintain backroom organization",
      ],
    },
    {
      id: "exp4",
      title: "Barista",
      company: "Starbucks",
      location: "Calgary, AB",
      startDate: "October 2015",
      endDate: "January 2016",
      bullets: [
        "Crafted high-quality espresso beverages and specialty drinks to brand standards in a fast-paced, high-traffic location",
        "Delivered warm, personalized customer experiences that encouraged repeat visits and positive feedback",
        "Processed cash and card transactions accurately using POS systems and balanced registers at end of shift",
        "Maintained a clean, organized workspace in compliance with health and safety standards",
      ],
    },
  ],
  education: [
    {
      id: "edu1",
      degree: "Office Administration Diploma",
      school: "Reeves College",
      location: "Calgary, AB",
    },
    {
      id: "edu2",
      degree: "Certificate in Computer Applications",
      school: "Datamatics",
      location: "Mauritius",
    },
    {
      id: "edu3",
      degree: "High School Diploma",
      school: "Patten College",
      location: "Mauritius",
    },
  ],
  volunteer: [
    "YMCA Northern Alberta",
    "Canadian Mental Health Association",
    "St. Gabriel School",
  ],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "French", level: "Fluent" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helper: resolve resume data for a given slug                      */
/* ------------------------------------------------------------------ */

async function getResumeData(slug: string): Promise<ResumeData | null> {
  // Static fallback — no Supabase needed
  if (slug === "reena") {
    return reenaData;
  }

  // Dynamic lookup via Supabase
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("data")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return null;
    }

    return data.data as ResumeData;
  } catch {
    // Supabase client may not be configured yet
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resumeData = await getResumeData(slug);

  if (!resumeData) {
    return { title: "Resume Not Found" };
  }

  const title = `${resumeData.name} — Resume`;
  const description = resumeData.summary
    ? resumeData.summary.slice(0, 160) + (resumeData.summary.length > 160 ? "..." : "")
    : `View ${resumeData.name}'s professional resume`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Kavora Resume Builder",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default async function ResumePage({ params }: PageProps) {
  const { slug } = await params;
  const resumeData = await getResumeData(slug);

  if (!resumeData) {
    notFound();
  }

  return <ResumeWeb data={resumeData} slug={slug} />;
}
