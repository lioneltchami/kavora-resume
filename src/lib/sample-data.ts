import type { ResumeData } from "./types";

export const sampleResume: ResumeData = {
  slug: "",
  name: "Sarah Chen",
  location: "Toronto, ON",
  phone: "(416) 555-0192",
  email: "sarah.chen@email.com",
  summary: "Results-oriented marketing professional with 6+ years of experience driving brand growth, digital campaign strategy, and cross-channel engagement for B2B SaaS companies. Proven track record of increasing qualified leads by 40% through data-driven content marketing and SEO optimization. Skilled at translating complex technical products into compelling narratives that resonate with target audiences. Passionate about building high-performing teams and fostering creative collaboration.",
  skills: [
    "Digital Marketing Strategy",
    "SEO & SEM",
    "Content Marketing",
    "Google Analytics",
    "HubSpot",
    "Social Media Management",
    "Email Marketing",
    "A/B Testing",
    "Brand Positioning",
    "Marketing Automation",
    "Copywriting",
    "Data Analysis"
  ],
  experience: [
    {
      id: "s1",
      title: "Senior Marketing Manager",
      company: "TechFlow Solutions",
      location: "Toronto, ON",
      startDate: "March 2023",
      endDate: "Present",
      bullets: [
        "Spearheaded a content marketing overhaul that increased organic traffic by 65% and generated 2,400+ qualified leads in the first year",
        "Managed a $500K annual marketing budget across paid search, social media, and content channels, achieving a 3.2x return on ad spend",
        "Led a team of 4 marketing specialists, implementing agile workflows that reduced campaign launch time by 30%",
        "Developed and executed ABM campaigns targeting enterprise accounts, contributing to $1.8M in new pipeline revenue"
      ]
    },
    {
      id: "s2",
      title: "Marketing Coordinator",
      company: "Greenleaf Digital",
      location: "Toronto, ON",
      startDate: "June 2020",
      endDate: "February 2023",
      bullets: [
        "Created and managed email marketing campaigns with an average open rate of 28% and click-through rate of 4.5%",
        "Coordinated 12+ product launches per year, collaborating with product, sales, and design teams to ensure cohesive go-to-market strategies",
        "Built and maintained the company blog, growing readership from 5,000 to 35,000 monthly visitors through SEO-optimized content",
        "Analyzed campaign performance using Google Analytics and HubSpot, presenting monthly insights to the leadership team"
      ]
    },
    {
      id: "s3",
      title: "Marketing Intern",
      company: "Bright Ideas Agency",
      location: "Vancouver, BC",
      startDate: "September 2019",
      endDate: "May 2020",
      bullets: [
        "Assisted in managing social media accounts across Instagram, LinkedIn, and Twitter, growing combined following by 15%",
        "Drafted blog posts, email newsletters, and press releases for a portfolio of 8 client accounts",
        "Conducted competitive analysis and market research to support strategic recommendations for client campaigns"
      ]
    }
  ],
  education: [
    { id: "se1", degree: "Bachelor of Commerce, Marketing", school: "University of British Columbia", location: "Vancouver, BC" },
    { id: "se2", degree: "Google Analytics Certification", school: "Google", location: "" },
    { id: "se3", degree: "HubSpot Inbound Marketing Certification", school: "HubSpot Academy", location: "" }
  ],
  volunteer: [
    "Marketing Committee Lead — Toronto Tech Community",
    "Mentor — Women in Digital Marketing Canada"
  ],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Mandarin", level: "Conversational" }
  ],
  paletteId: "modern-teal"
};
