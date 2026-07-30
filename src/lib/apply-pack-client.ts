import JSZip from "jszip";
import {
	applyPackFilenames,
	buildAtsResumePdf,
	buildCoverLetterPdf,
	buildShareLinkText,
} from "./apply-pack";
import type { ResumeData } from "./types";

export interface ApplyPackInput {
	resume: ResumeData;
	coverLetter: string;
	shareUrl: string;
	company?: string;
}

export interface ApplyPackResult {
	blob: Blob;
	filename: string;
}

export async function buildApplyPackZip(
	input: ApplyPackInput,
): Promise<ApplyPackResult> {
	const names = applyPackFilenames({
		name: input.resume.name,
		company: input.company || input.resume.targetCompany,
	});

	const [resumePdf, letterPdf] = await Promise.all([
		buildAtsResumePdf(input.resume),
		buildCoverLetterPdf({
			name: input.resume.name,
			fullLetter: input.coverLetter,
			company: input.company || input.resume.targetCompany,
		}),
	]);

	const zip = new JSZip();
	zip.file(names.resumeName, resumePdf);
	zip.file(names.letterName, letterPdf);
	zip.file(names.linkName, buildShareLinkText(input.shareUrl));

	const blob = await zip.generateAsync({ type: "blob" });
	return { blob, filename: names.zipName };
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
