import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
	applyPackFilenames,
	buildAtsResumePdf,
	buildCoverLetterPdf,
	buildShareLinkText,
	sanitizePackFilename,
	wrapText,
} from "./apply-pack";
import { buildApplyPackZip } from "./apply-pack-client";
import type { ResumeData } from "./types";

const sampleResume: ResumeData = {
	slug: "jane-acme",
	name: "Jane Doe",
	location: "Austin, TX",
	phone: "555-0100",
	email: "jane@example.com",
	summary: "Backend engineer with cloud experience.",
	skills: ["Go", "Postgres", "Kubernetes"],
	experience: [
		{
			id: "1",
			title: "Backend Engineer",
			company: "Acme",
			location: "Remote",
			startDate: "2022",
			endDate: "Present",
			bullets: ["Built APIs that scaled to 1M requests/day"],
		},
	],
	education: [
		{
			id: "e1",
			degree: "B.S. Computer Science",
			school: "State University",
			location: "TX",
		},
	],
	volunteer: [],
	languages: [{ name: "English", level: "Fluent" }],
	targetCompany: "Acme",
	targetRole: "Backend",
};

describe("apply pack helpers", () => {
	it("sanitizes filenames", () => {
		expect(sanitizePackFilename("Jane Doe / Acme!")).toBe("Jane_Doe_Acme");
		expect(sanitizePackFilename("")).toBe("File");
	});

	it("builds pack filenames", () => {
		const names = applyPackFilenames({ name: "Jane Doe", company: "Acme Inc" });
		expect(names.zipName).toBe("Apply_Pack_Jane_Doe_Acme_Inc.zip");
		expect(names.resumeName).toBe("Jane_Doe_Resume.pdf");
		expect(names.letterName).toBe("Jane_Doe_Cover_Letter.pdf");
		expect(names.linkName).toBe("Share_Link.txt");
	});

	it("wraps text within width", async () => {
		const doc = await PDFDocument.create();
		const font = await doc.embedFont(StandardFonts.Helvetica);
		const lines = wrapText(
			"This is a reasonably long sentence that should wrap into multiple lines for letter width.",
			font,
			11,
			200,
		);
		expect(lines.length).toBeGreaterThan(1);
	});

	it("builds PDF bytes with PDF header", async () => {
		const resumePdf = await buildAtsResumePdf(sampleResume);
		const letterPdf = await buildCoverLetterPdf({
			name: "Jane Doe",
			fullLetter:
				"Dear Hiring Manager,\n\nI am excited to apply.\n\nSincerely,\nJane",
			company: "Acme",
		});
		expect(String.fromCharCode(...resumePdf.slice(0, 4))).toBe("%PDF");
		expect(String.fromCharCode(...letterPdf.slice(0, 4))).toBe("%PDF");
	});

	it("builds share link text", () => {
		expect(buildShareLinkText("https://kavoraresume.cv/r/jane")).toContain(
			"https://kavoraresume.cv/r/jane",
		);
	});

	it("builds ZIP with expected entries", async () => {
		const { blob, filename } = await buildApplyPackZip({
			resume: sampleResume,
			coverLetter: "Dear Hiring Manager,\n\nHello.\n\nSincerely,\nJane",
			shareUrl: "https://kavoraresume.cv/r/jane-acme",
			company: "Acme",
		});
		expect(filename).toContain("Apply_Pack_");
		const zip = await JSZip.loadAsync(await blob.arrayBuffer());
		const names = Object.keys(zip.files);
		expect(names).toContain("Jane_Doe_Resume.pdf");
		expect(names).toContain("Jane_Doe_Cover_Letter.pdf");
		expect(names).toContain("Share_Link.txt");
	});
});
