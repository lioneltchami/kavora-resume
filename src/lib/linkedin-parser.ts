import type { EducationEntry, ExperienceEntry, ResumeData } from "./types";
import { createId } from "./types";

export function parseLinkedInText(text: string): Partial<ResumeData> {
	const lines = text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

	const result: Partial<ResumeData> = {
		experience: [],
		education: [],
		skills: [],
		languages: [],
		volunteer: [],
	};

	// Try to extract name (usually first meaningful line)
	if (lines.length > 0) {
		const firstLine = lines[0];
		if (firstLine.length < 50 && !isSectionHeader(firstLine)) {
			result.name = firstLine;
		}
	}

	// Find sections by common LinkedIn headers
	let currentSection = "";
	let currentEntry: (ExperienceEntry & { _filled?: boolean }) | null = null;
	let currentEduEntry: (EducationEntry & { _filled?: boolean }) | null = null;
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Detect section headers
		if (/^Experience$/i.test(line)) {
			currentSection = "experience";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		if (/^Education$/i.test(line)) {
			currentSection = "education";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		if (/^Skills$/i.test(line) || /^Skills & [Ee]ndorsements$/i.test(line)) {
			currentSection = "skills";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		if (/^Languages$/i.test(line)) {
			currentSection = "languages";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		if (/^Volunteer/i.test(line)) {
			currentSection = "volunteer";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		if (/^About$/i.test(line) || /^Summary$/i.test(line)) {
			currentSection = "summary";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		if (/^Contact$/i.test(line) || /^Contact Info$/i.test(line)) {
			currentSection = "contact";
			currentEntry = null;
			currentEduEntry = null;
			i++;
			continue;
		}
		// Skip these sections
		if (
			/^(Recommendations|Interests|Publications|Certifications|Honors|Projects|Courses|Organizations|Activity|People also viewed|People you may know|Show all|See all|More activity)/i.test(
				line,
			)
		) {
			currentSection = "skip";
			i++;
			continue;
		}

		if (currentSection === "skip") {
			i++;
			continue;
		}

		if (currentSection === "summary") {
			result.summary =
				(result.summary || "") + (result.summary ? " " : "") + line;
		}

		if (currentSection === "contact") {
			// Try to extract email
			const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
			if (emailMatch) result.email = emailMatch[0];
			// Try to extract phone
			const phoneMatch = line.match(
				/[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/,
			);
			if (phoneMatch && phoneMatch[0].replace(/\D/g, "").length >= 7)
				result.phone = phoneMatch[0];
			// Try to extract location
			if (
				/,\s*(Canada|USA|US|UK|Australia|India|France|Germany|Spain|Italy|Netherlands|Sweden|Norway|Denmark|Finland|Ireland|Switzerland|Belgium|Austria|Portugal|Brazil|Mexico|Japan|South Korea|Singapore|Hong Kong|China)/i.test(
					line,
				) ||
				/\b(AB|BC|ON|QC|MB|SK|NS|NB|PE|NL|YT|NT|NU|CA|NY|TX|FL|WA|OR|IL|MA|PA|OH|GA|NC|VA|CO|AZ|MN|WI|MI|NJ|CT|MD)\b/.test(
					line,
				)
			) {
				result.location = line;
			}
		}

		if (currentSection === "experience") {
			const isDateLine =
				/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i.test(
					line,
				);
			const isDuration = /\b\d+\s*(yr|year|mo|month|mos)/i.test(line);
			const hasCompanyMarker = /[·•\-–—]/.test(line);

			if (
				!isDateLine &&
				!isDuration &&
				!hasCompanyMarker &&
				line.length < 80 &&
				line.length > 2 &&
				!currentEntry
			) {
				// Likely a job title
				currentEntry = {
					id: createId(),
					title: line,
					company: "",
					location: "",
					startDate: "",
					endDate: "",
					bullets: [],
				};
				result.experience!.push(currentEntry);
			} else if (currentEntry && hasCompanyMarker && !currentEntry.company) {
				// Company line (e.g. "Google · Full-time")
				currentEntry.company = line.split(/[·•\-–—]/)[0].trim();
			} else if (currentEntry && isDateLine) {
				// Date line
				const dates = line.match(
					/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi,
				);
				if (dates && dates.length >= 1) {
					currentEntry.startDate = dates[0];
					currentEntry.endDate = dates.length >= 2 ? dates[1] : "Present";
				}
				if (/present/i.test(line)) {
					currentEntry.endDate = "Present";
				}
			} else if (currentEntry && line.length > 30) {
				// Probably a description bullet
				currentEntry.bullets.push(line.replace(/^[·•\-–—]\s*/, ""));
			} else if (
				currentEntry &&
				!isDateLine &&
				!isDuration &&
				line.length < 60 &&
				line.length > 2
			) {
				// Could be location or a new title
				if (!currentEntry.location && /,/.test(line)) {
					currentEntry.location = line;
				} else {
					// Might be a new job title - reset for next entry
					currentEntry = {
						id: createId(),
						title: line,
						company: "",
						location: "",
						startDate: "",
						endDate: "",
						bullets: [],
					};
					result.experience!.push(currentEntry);
				}
			}
		}

		if (currentSection === "education") {
			const isDateLine =
				/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i.test(
					line,
				) || /\b\d{4}\s*[-–]\s*\d{4}\b/.test(line);

			if (isDateLine) {
				// Skip date lines in education
				i++;
				continue;
			}

			// Check if this looks like a school name (start a new entry)
			if (
				line.length > 2 &&
				line.length < 100 &&
				(!currentEduEntry || currentEduEntry._filled)
			) {
				currentEduEntry = {
					id: createId(),
					degree: "",
					school: line,
					location: "",
					_filled: false,
				} as EducationEntry & { _filled?: boolean };
				result.education!.push(currentEduEntry);
			} else if (currentEduEntry && !currentEduEntry.degree) {
				// Second line is likely the degree
				currentEduEntry.degree = line;
				currentEduEntry._filled = true;
			} else if (currentEduEntry && line.length > 2 && line.length < 80) {
				// Additional info - could be field of study
				if (
					/degree|bachelor|master|phd|diploma|certificate|bsc|msc|mba|ba\b|bs\b|b\.s\.|m\.s\.|associate/i.test(
						line,
					)
				) {
					currentEduEntry.degree = line;
					currentEduEntry._filled = true;
				}
			}
		}

		if (currentSection === "skills") {
			// Skills are usually one per line or comma-separated
			if (
				line.length > 1 &&
				line.length < 60 &&
				!/^\d+/.test(line) &&
				!/endorsement/i.test(line) &&
				!/see (all|\d+)/i.test(line)
			) {
				// Handle comma-separated skills
				if (line.includes(",")) {
					const parts = line
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean);
					result.skills!.push(...parts);
				} else {
					result.skills!.push(line);
				}
			}
		}

		if (currentSection === "languages") {
			if (line.length > 1 && line.length < 40) {
				const proficiency =
					/native|fluent|professional|elementary|limited|basic|conversational/i;
				const match = line.match(proficiency);
				result.languages!.push({
					name: line
						.replace(proficiency, "")
						.replace(/[·•\-–—()]/g, "")
						.trim(),
					level: match
						? match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase()
						: "Fluent",
				});
			}
		}

		if (currentSection === "volunteer") {
			if (line.length > 2 && line.length < 80) {
				result.volunteer!.push(line);
			}
		}

		i++;
	}

	// Clean up: remove empty entries and internal fields
	result.experience = result.experience!.filter((e) => e.title || e.company);
	result.education = result
		.education!.filter((e) => e.school || e.degree)
		.map(({ _filled, ...rest }: any) => rest as EducationEntry);
	result.skills = result.skills!.slice(0, 15);
	result.volunteer = result.volunteer!.slice(0, 5);
	result.languages = result
		.languages!.filter((l) => l.name.length > 0)
		.slice(0, 5);

	return result;
}

function isSectionHeader(line: string): boolean {
	return /^(Experience|Education|Skills|About|Summary|Contact|Languages|Volunteer|Recommendations|Interests|Publications|Activity)$/i.test(
		line,
	);
}

/**
 * Summarizes what was extracted from the parsed data.
 */
export function summarizeParsed(data: Partial<ResumeData>): string {
	const parts: string[] = [];
	if (data.name) parts.push(`Name: ${data.name}`);
	if (data.email) parts.push(`Email`);
	if (data.phone) parts.push(`Phone`);
	if (data.location) parts.push(`Location`);
	if (data.summary) parts.push(`Summary`);
	if (data.experience?.length)
		parts.push(
			`${data.experience.length} experience${data.experience.length > 1 ? "s" : ""}`,
		);
	if (data.education?.length)
		parts.push(
			`${data.education.length} education${data.education.length > 1 ? " entries" : " entry"}`,
		);
	if (data.skills?.length) parts.push(`${data.skills.length} skills`);
	if (data.languages?.length) parts.push(`${data.languages.length} languages`);
	if (data.volunteer?.length)
		parts.push(`${data.volunteer.length} volunteer items`);
	return parts.join(", ");
}
