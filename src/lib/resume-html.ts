import type { ResumeData } from "./types";
import { getPalette } from "./types";

export function escHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Strictly ATS-safe single-column HTML resume.
 * No flexbox/grid/multi-column; system fonts only; no photo.
 */
export function buildATSSafeHTML(data: ResumeData): string {
	const palette = getPalette(data.paletteId);
	const esc = escHtml;

	const experienceHTML = data.experience
		.map(
			(exp) => `
      <div class="job">
        <div class="job-title">${esc(exp.title)}</div>
        <div class="job-meta">${esc(exp.company)}${exp.location ? ` — ${esc(exp.location)}` : ""} | ${esc(exp.startDate)} – ${esc(exp.endDate)}</div>
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
        <strong>${esc(edu.degree)}</strong> — ${esc(edu.school)}${edu.location ? `, ${esc(edu.location)}` : ""}
      </div>`,
		)
		.join("");

	const skillsText =
		data.skills.length > 0 ? data.skills.map((s) => esc(s)).join(" · ") : "";

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
							`<div class="lang-item">${esc(l.name)} — ${esc(l.level)}</div>`,
					)
					.join("")
			: "";

	const contactParts = [data.location, data.phone, data.email].filter(Boolean);

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(data.name)} - Resume</title>
<style>
  /* ATS-Safe: NO flexbox, NO grid, NO multi-column */
  @page { size: letter; margin: 0.5in 0.65in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    color: #000000;
    line-height: 1.4;
  }
  .name {
    font-size: 20pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
    color: ${palette.primary};
  }
  .contact {
    font-size: 9pt;
    color: #333333;
    margin-bottom: 8px;
  }
  .divider {
    border: none;
    border-top: 2px solid ${palette.primary};
    margin: 6px 0 8px 0;
  }
  .section-title {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${palette.primary};
    border-bottom: 1px solid ${palette.primary};
    padding-bottom: 2px;
    margin: 10px 0 5px 0;
  }
  .summary {
    font-size: 9.5pt;
    color: #222222;
    line-height: 1.5;
    margin-bottom: 6px;
  }
  .skills-text {
    font-size: 9pt;
    color: #222222;
    line-height: 1.6;
    margin-bottom: 6px;
  }
  .job { margin-bottom: 8px; }
  .job-title {
    font-size: 10pt;
    font-weight: bold;
    color: #000000;
  }
  .job-meta {
    font-size: 9pt;
    color: #444444;
    margin-bottom: 3px;
  }
  .bullets {
    list-style-type: disc;
    padding-left: 18px;
    margin-top: 3px;
  }
  .bullets li {
    font-size: 9pt;
    color: #222222;
    line-height: 1.4;
    margin-bottom: 2px;
  }
  .edu-item {
    font-size: 9.5pt;
    color: #222222;
    margin-bottom: 4px;
    line-height: 1.35;
  }
  .vol-item, .lang-item {
    font-size: 9pt;
    color: #333333;
    margin-bottom: 3px;
  }
</style>
</head>
<body>
  <div class="name">${esc(data.name)}</div>
  ${contactParts.length > 0 ? `<div class="contact">${contactParts.map((p) => esc(p)).join(" | ")}</div>` : ""}
  <hr class="divider">

  ${data.summary ? `<div class="section-title">Professional Summary</div><p class="summary">${esc(data.summary)}</p>` : ""}

  ${skillsText ? `<div class="section-title">Core Competencies</div><p class="skills-text">${skillsText}</p>` : ""}

  ${data.experience.length > 0 ? `<div class="section-title">Professional Experience</div>${experienceHTML}` : ""}

  ${data.education.length > 0 ? `<div class="section-title">Education</div>${educationHTML}` : ""}

  ${volunteerHTML ? `<div class="section-title">Volunteer Experience</div>${volunteerHTML}` : ""}

  ${languagesHTML ? `<div class="section-title">Languages</div>${languagesHTML}` : ""}
</body>
</html>`;
}
