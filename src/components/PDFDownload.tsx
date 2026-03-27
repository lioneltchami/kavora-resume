"use client";

import { useCallback, useState } from "react";
import type { ResumeData } from "@/lib/types";
import { getLayout, getPalette } from "@/lib/types";

interface PDFDownloadProps {
  name: string;
  data?: ResumeData;
}

export default function PDFDownload({ name, data }: PDFDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(() => {
    if (!data) {
      // Fallback: just print the preview
      window.print();
      return;
    }

    setGenerating(true);

    // Build an ATS-friendly HTML document with real, selectable text
    const html = buildATSResumeHTML(data);

    // Open in a hidden iframe and trigger print (Save as PDF)
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      setGenerating(false);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Wait for fonts to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe);
          setGenerating(false);
        }, 1000);
      }, 500);
    };
  }, [data]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      {generating ? "Generating..." : "Download PDF"}
    </button>
  );
}

/**
 * Builds a clean, ATS-parseable HTML resume document.
 * Uses real text (not images), standard HTML elements,
 * and simple CSS that prints perfectly on letter-size paper.
 */
function buildATSResumeHTML(data: ResumeData): string {
  const palette = getPalette(data.paletteId);
  const layout = getLayout(data.layoutId);

  const experienceHTML = data.experience
    .map(
      (exp) => `
      <div class="job">
        <div class="job-header">
          <span class="job-title">${esc(exp.title)}</span>
          <span class="job-dates">${esc(exp.startDate)} &ndash; ${esc(exp.endDate)}</span>
        </div>
        <div class="job-company">${esc(exp.company)}${exp.location ? ` &mdash; ${esc(exp.location)}` : ""}</div>
        ${
          exp.bullets.length > 0
            ? `<ul class="bullets">${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
    )
    .join("");

  const educationHTML = data.education
    .map(
      (edu) => `
      <div class="edu-item">
        <strong>${esc(edu.degree)}</strong><br/>
        <span class="edu-school">${esc(edu.school)}${edu.location ? ` &mdash; ${esc(edu.location)}` : ""}</span>
      </div>`,
    )
    .join("");

  const skillsHTML =
    data.skills.length > 0
      ? `<div class="skills-row">${data.skills.map((s) => `<span class="skill-tag">${esc(s)}</span>`).join("")}</div>`
      : "";

  const volunteerHTML =
    data.volunteer.filter(Boolean).length > 0
      ? data.volunteer
          .filter(Boolean)
          .map((v) => `<div class="vol-item">${esc(v)}</div>`)
          .join("")
      : "";

  const languagesHTML =
    data.languages.length > 0
      ? data.languages
          .map(
            (l) =>
              `<div class="lang-item"><strong>${esc(l.name)}</strong> &mdash; ${esc(l.level)}</div>`,
          )
          .join("")
      : "";

  const contactStr = [data.location, data.phone, data.email]
    .filter(Boolean)
    .join(" | ");
  const photoHTML = data.photo
    ? `<img src="${data.photo}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;margin:0 auto 6px;display:block;border:2px solid ${palette.accent}" />`
    : "";

  switch (layout.id) {
    case "modern":
      return buildModernHTML(
        data,
        palette,
        experienceHTML,
        educationHTML,
        skillsHTML,
        volunteerHTML,
        languagesHTML,
        contactStr,
        photoHTML,
      );
    case "compact":
      return buildCompactHTML(
        data,
        palette,
        experienceHTML,
        educationHTML,
        skillsHTML,
        volunteerHTML,
        languagesHTML,
        contactStr,
        photoHTML,
      );
    case "executive":
      return buildExecutiveHTML(
        data,
        palette,
        experienceHTML,
        educationHTML,
        skillsHTML,
        volunteerHTML,
        languagesHTML,
        contactStr,
        photoHTML,
      );
    default:
      return buildClassicHTML(
        data,
        palette,
        experienceHTML,
        educationHTML,
        skillsHTML,
        volunteerHTML,
        languagesHTML,
        contactStr,
        photoHTML,
      );
  }
}

function buildClassicHTML(
  data: ResumeData,
  palette: { primary: string; accent: string; headerBg: string },
  experienceHTML: string,
  educationHTML: string,
  skillsHTML: string,
  volunteerHTML: string,
  languagesHTML: string,
  contactStr: string,
  photoHTML: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(data.name)} - Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: letter; margin: 0.45in 0.55in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.4; }

  .header { text-align: center; margin-bottom: 6px; }
  .header h1 { font-size: 22pt; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 4px; color: ${palette.primary}; }
  .contact { font-size: 9pt; color: #555; }
  .divider { height: 2px; background: linear-gradient(90deg, ${palette.primary}, ${palette.accent}); margin: 8px 0; border: none; }
  .divider-thin { height: 1px; background: #d0d0d0; margin: 5px 0; border: none; }

  .section-title {
    font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
    color: ${palette.primary}; border-bottom: 1.5px solid ${palette.primary}; padding-bottom: 2px; margin: 8px 0 4px 0;
  }

  .summary { font-size: 9pt; color: #333; line-height: 1.5; text-align: justify; margin: 4px 0 6px 0; }

  .skills-row { display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 4px 0 6px 0; }
  .skill-tag {
    font-size: 8pt; background: ${palette.primary}15; color: ${palette.primary}; padding: 2px 8px;
    border-radius: 3px; border: 1px solid ${palette.primary}30; font-weight: 500;
  }

  .job { margin: 6px 0; }
  .job-header { display: flex; justify-content: space-between; align-items: baseline; }
  .job-title { font-size: 10pt; font-weight: 700; color: #1a1a1a; }
  .job-dates { font-size: 8.5pt; color: #555; font-style: italic; }
  .job-company { font-size: 9pt; color: ${palette.primary}; font-weight: 600; margin-bottom: 2px; }

  .bullets { list-style: none; padding-left: 12px; margin-top: 2px; }
  .bullets li {
    font-size: 9pt; color: #333; line-height: 1.45; margin-bottom: 1.5px;
    padding-left: 9px; position: relative;
  }
  .bullets li::before {
    content: "\\25AA"; position: absolute; left: -4px; color: ${palette.primary}; font-size: 6pt; top: 2px;
  }

  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; margin-top: 4px; }
  .edu-item { font-size: 9pt; margin: 3px 0; line-height: 1.35; }
  .edu-item strong { color: #1a1a1a; }
  .edu-school { color: #555; font-size: 8.5pt; }
  .vol-item { font-size: 9pt; color: #333; margin: 2px 0; }
  .lang-item { font-size: 9pt; color: #333; margin: 2px 0; }
</style>
</head>
<body>
  <div class="header">
    ${photoHTML}
    <h1>${esc(data.name).toUpperCase()}</h1>
    <div class="contact">${contactStr}</div>
  </div>
  <hr class="divider">

  ${data.summary ? `<div class="section-title">Professional Summary</div><p class="summary">${esc(data.summary)}</p>` : ""}

  ${data.skills.length > 0 ? `<div class="section-title">Core Competencies</div>${skillsHTML}` : ""}

  ${data.experience.length > 0 ? `<div class="section-title">Professional Experience</div>${experienceHTML}` : ""}

  ${data.education.length > 0 || data.volunteer.filter(Boolean).length > 0 || data.languages.length > 0 ? `<hr class="divider-thin">` : ""}

  <div class="bottom-grid">
    <div>
      ${data.education.length > 0 ? `<div class="section-title">Education</div>${educationHTML}` : ""}
    </div>
    <div>
      ${volunteerHTML ? `<div class="section-title">Volunteer Experience</div>${volunteerHTML}` : ""}
      ${languagesHTML ? `<div class="section-title" style="margin-top:8px">Languages</div>${languagesHTML}` : ""}
    </div>
  </div>
</body>
</html>`;
}

function buildModernHTML(
  data: ResumeData,
  palette: { primary: string; accent: string; headerBg: string },
  experienceHTML: string,
  educationHTML: string,
  skillsHTML: string,
  volunteerHTML: string,
  languagesHTML: string,
  contactStr: string,
  photoHTML: string,
): string {
  const sidebarSkills =
    data.skills.length > 0
      ? data.skills
          .map((s) => `<span class="sidebar-skill">${esc(s)}</span>`)
          .join("")
      : "";

  const sidebarLanguages =
    data.languages.length > 0
      ? data.languages
          .map(
            (l) =>
              `<div class="sidebar-lang"><strong>${esc(l.name)}</strong> &mdash; ${esc(l.level)}</div>`,
          )
          .join("")
      : "";

  const sidebarEducation = data.education
    .map(
      (edu) =>
        `<div class="sidebar-edu"><strong>${esc(edu.degree)}</strong><br/><span>${esc(edu.school)}${edu.location ? ` &mdash; ${esc(edu.location)}` : ""}</span></div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(data.name)} - Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: letter; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.4; }

  .layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 30%; background: ${palette.headerBg}; color: white;
    padding: 36px 20px 28px; font-size: 8pt;
  }
  .sidebar-section-title {
    font-size: 8pt; font-weight: 700; color: ${palette.accent};
    text-transform: uppercase; letter-spacing: 1.5px; margin: 14px 0 5px 0;
  }
  .sidebar-name {
    font-size: 16pt; font-weight: 700; color: white; line-height: 1.2; margin-bottom: 10px;
  }
  .sidebar-contact { font-size: 8pt; line-height: 1.6; color: rgba(255,255,255,0.85); }
  .sidebar-skill {
    display: inline-block; background: rgba(255,255,255,0.12); color: white;
    font-size: 7.5pt; padding: 2px 7px; border-radius: 3px; margin: 2px 2px 2px 0; font-weight: 500;
  }
  .sidebar-lang { margin: 2px 0; color: rgba(255,255,255,0.85); }
  .sidebar-lang strong { color: white; }
  .sidebar-edu { margin: 4px 0; font-size: 8pt; }
  .sidebar-edu strong { color: white; font-size: 8.5pt; }
  .sidebar-edu span { color: rgba(255,255,255,0.65); font-size: 7.5pt; }

  .main { width: 70%; padding: 36px 32px 28px 28px; }

  .section-title {
    font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
    color: ${palette.primary}; border-bottom: 1.5px solid ${palette.primary}; padding-bottom: 2px; margin: 10px 0 4px 0;
  }
  .summary { font-size: 9pt; color: #333; line-height: 1.5; text-align: justify; margin: 4px 0 6px 0; }
  .divider { height: 2px; background: ${palette.accent}; margin: 8px 0; border: none; }

  .job { margin: 6px 0; }
  .job-header { display: flex; justify-content: space-between; align-items: baseline; }
  .job-title { font-size: 10pt; font-weight: 700; color: #1a1a1a; }
  .job-dates { font-size: 8.5pt; color: #555; font-style: italic; }
  .job-company { font-size: 9pt; color: ${palette.primary}; font-weight: 600; margin-bottom: 2px; }
  .bullets { list-style: none; padding-left: 12px; margin-top: 2px; }
  .bullets li {
    font-size: 9pt; color: #333; line-height: 1.45; margin-bottom: 1.5px;
    padding-left: 9px; position: relative;
  }
  .bullets li::before {
    content: "\\25AA"; position: absolute; left: -4px; color: ${palette.primary}; font-size: 6pt; top: 2px;
  }
  .vol-item { font-size: 9pt; color: #333; margin: 2px 0; }
</style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      ${data.photo ? `<img src="${data.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid ${palette.accent};display:block;margin:0 auto 10px" />` : ""}
      <div class="sidebar-name">${esc(data.name)}</div>
      <div class="sidebar-section-title">Contact</div>
      <div class="sidebar-contact">
        ${data.location ? `<div>${esc(data.location)}</div>` : ""}
        ${data.phone ? `<div>${esc(data.phone)}</div>` : ""}
        ${data.email ? `<div>${esc(data.email)}</div>` : ""}
      </div>
      ${data.skills.length > 0 ? `<div class="sidebar-section-title">Skills</div><div>${sidebarSkills}</div>` : ""}
      ${data.languages.length > 0 ? `<div class="sidebar-section-title">Languages</div><div>${sidebarLanguages}</div>` : ""}
      ${data.education.length > 0 ? `<div class="sidebar-section-title">Education</div>${sidebarEducation}` : ""}
    </div>
    <div class="main">
      ${data.summary ? `<div class="section-title">Professional Summary</div><p class="summary">${esc(data.summary)}</p>` : ""}
      <hr class="divider">
      ${data.experience.length > 0 ? `<div class="section-title">Professional Experience</div>${experienceHTML}` : ""}
      ${volunteerHTML ? `<div class="section-title" style="margin-top:10px">Volunteer Experience</div>${volunteerHTML}` : ""}
    </div>
  </div>
</body>
</html>`;
}

function buildCompactHTML(
  data: ResumeData,
  palette: { primary: string; accent: string; headerBg: string },
  experienceHTML: string,
  educationHTML: string,
  skillsHTML: string,
  volunteerHTML: string,
  languagesHTML: string,
  contactStr: string,
  photoHTML: string,
): string {
  // Compact experience with smaller fonts
  const compactExpHTML = data.experience
    .map(
      (exp) => `
      <div class="job">
        <div class="job-title">${esc(exp.title)}</div>
        <div class="job-company">${esc(exp.company)}${exp.location ? ` &mdash; ${esc(exp.location)}` : ""}</div>
        <div class="job-dates">${esc(exp.startDate)} &ndash; ${esc(exp.endDate)}</div>
        ${
          exp.bullets.length > 0
            ? `<ul class="bullets">${exp.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(data.name)} - Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: letter; margin: 0.4in 0.5in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', Arial, Helvetica, sans-serif; font-size: 9pt; color: #1a1a1a; line-height: 1.35; }

  .header { text-align: center; margin-bottom: 4px; }
  .header h1 { font-size: 20pt; font-weight: 700; letter-spacing: 1px; margin-bottom: 3px; color: ${palette.primary}; }
  .contact { font-size: 8.5pt; color: #555; }
  .divider { height: 2px; background: linear-gradient(90deg, ${palette.primary}, ${palette.accent}); margin: 6px 0; border: none; }
  .divider-thin { height: 1px; background: #d0d0d0; margin: 4px 0; border: none; }

  .section-title {
    font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
    color: ${palette.primary}; border-bottom: 1px solid ${palette.primary}; padding-bottom: 2px; margin: 6px 0 3px 0;
  }
  .summary { font-size: 8.5pt; color: #333; line-height: 1.45; text-align: justify; margin: 3px 0 4px 0; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }

  .skills-row { display: flex; flex-wrap: wrap; gap: 3px 5px; margin: 3px 0 4px 0; }
  .skill-tag {
    font-size: 7.5pt; background: ${palette.primary}15; color: ${palette.primary}; padding: 1px 6px;
    border-radius: 3px; border: 1px solid ${palette.primary}30; font-weight: 500;
  }

  .job { margin: 4px 0; }
  .job-title { font-size: 9pt; font-weight: 700; color: #1a1a1a; }
  .job-dates { font-size: 7.5pt; color: #888; font-style: italic; margin-bottom: 1px; }
  .job-company { font-size: 8pt; color: ${palette.primary}; font-weight: 600; }
  .bullets { list-style: none; padding-left: 10px; margin-top: 1px; }
  .bullets li {
    font-size: 8pt; color: #333; line-height: 1.35; margin-bottom: 1px;
    padding-left: 8px; position: relative;
  }
  .bullets li::before {
    content: "\\25AA"; position: absolute; left: -3px; color: ${palette.primary}; font-size: 5pt; top: 2px;
  }

  .edu-item { font-size: 8.5pt; margin: 3px 0; line-height: 1.3; }
  .edu-item strong { color: #1a1a1a; }
  .edu-school { color: #555; font-size: 8pt; }
  .vol-item { font-size: 8.5pt; color: #333; margin: 2px 0; }
  .lang-item { font-size: 8.5pt; color: #333; margin: 2px 0; }
</style>
</head>
<body>
  <div class="header">
    ${photoHTML}
    <h1>${esc(data.name).toUpperCase()}</h1>
    <div class="contact">${contactStr}</div>
  </div>
  <hr class="divider">

  ${data.summary ? `<div class="section-title">Professional Summary</div><p class="summary">${esc(data.summary)}</p>` : ""}

  <hr class="divider-thin">

  <div class="two-col">
    <div>
      ${data.experience.length > 0 ? `<div class="section-title">Experience</div>${compactExpHTML}` : ""}
    </div>
    <div>
      ${data.skills.length > 0 ? `<div class="section-title">Core Competencies</div>${skillsHTML}` : ""}
      ${data.education.length > 0 ? `<div class="section-title">Education</div>${educationHTML}` : ""}
      ${volunteerHTML ? `<div class="section-title">Volunteer</div>${volunteerHTML}` : ""}
      ${languagesHTML ? `<div class="section-title">Languages</div>${languagesHTML}` : ""}
    </div>
  </div>
</body>
</html>`;
}

function buildExecutiveHTML(
  data: ResumeData,
  palette: { primary: string; accent: string; headerBg: string },
  experienceHTML: string,
  educationHTML: string,
  skillsHTML: string,
  volunteerHTML: string,
  languagesHTML: string,
  contactStr: string,
  photoHTML: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(data.name)} - Resume</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: letter; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.4; }

  .exec-header {
    background: ${palette.headerBg}; color: white; text-align: center;
    padding: 32px 48px 24px;
  }
  .exec-header h1 {
    font-size: 26pt; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 6px; color: white;
  }
  .exec-header .contact { font-size: 9pt; color: ${palette.accent}; letter-spacing: 1px; }

  .exec-body { padding: 20px 48px 28px; }

  .section-title {
    font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
    color: ${palette.primary}; border-bottom: 2px solid ${palette.accent}; padding-bottom: 3px; margin: 12px 0 6px 0;
  }

  .summary { font-size: 10pt; color: #333; line-height: 1.55; text-align: justify; margin: 6px 0 8px 0; }

  .skills-row { display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 4px 0 6px 0; }
  .skill-tag {
    font-size: 8pt; background: ${palette.primary}15; color: ${palette.primary}; padding: 2px 8px;
    border-radius: 3px; border: 1px solid ${palette.primary}30; font-weight: 500;
  }

  .job { margin: 6px 0; }
  .job-header { display: flex; justify-content: space-between; align-items: baseline; }
  .job-title { font-size: 10pt; font-weight: 700; color: #1a1a1a; }
  .job-dates { font-size: 8.5pt; color: #555; font-style: italic; }
  .job-company { font-size: 9pt; color: ${palette.primary}; font-weight: 600; margin-bottom: 2px; }
  .bullets { list-style: none; padding-left: 12px; margin-top: 2px; }
  .bullets li {
    font-size: 9pt; color: #333; line-height: 1.45; margin-bottom: 1.5px;
    padding-left: 9px; position: relative;
  }
  .bullets li::before {
    content: "\\25AA"; position: absolute; left: -4px; color: ${palette.primary}; font-size: 6pt; top: 2px;
  }

  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; margin-top: 4px; }
  .edu-item { font-size: 9pt; margin: 3px 0; line-height: 1.35; }
  .edu-item strong { color: #1a1a1a; }
  .edu-school { color: #555; font-size: 8.5pt; }
  .vol-item { font-size: 9pt; color: #333; margin: 2px 0; }
  .lang-item { font-size: 9pt; color: #333; margin: 2px 0; }
</style>
</head>
<body>
  <div class="exec-header">
    ${data.photo ? `<img src="${data.photo}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid ${palette.accent};display:block;margin:0 auto 8px" />` : ""}
    <h1>${esc(data.name)}</h1>
    <div class="contact">${contactStr}</div>
  </div>
  <div class="exec-body">
    ${data.summary ? `<div class="section-title">Professional Summary</div><p class="summary">${esc(data.summary)}</p>` : ""}

    ${data.skills.length > 0 ? `<div class="section-title">Core Competencies</div>${skillsHTML}` : ""}

    ${data.experience.length > 0 ? `<div class="section-title">Professional Experience</div>${experienceHTML}` : ""}

    <div class="bottom-grid">
      <div>
        ${data.education.length > 0 ? `<div class="section-title">Education</div>${educationHTML}` : ""}
      </div>
      <div>
        ${volunteerHTML ? `<div class="section-title">Volunteer Experience</div>${volunteerHTML}` : ""}
        ${languagesHTML ? `<div class="section-title" style="margin-top:8px">Languages</div>${languagesHTML}` : ""}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
