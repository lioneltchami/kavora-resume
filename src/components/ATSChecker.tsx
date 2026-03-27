"use client";

import { useState } from "react";
import type { ResumeData } from "@/lib/types";

interface ATSResult {
	score: number;
	matched: string[];
	missing: string[];
	totalKeywords: number;
}

function analyzeATS(resumeText: string, jobDescription: string): ATSResult {
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
		"by",
		"is",
		"are",
		"was",
		"were",
		"be",
		"been",
		"being",
		"have",
		"has",
		"had",
		"do",
		"does",
		"did",
		"will",
		"would",
		"could",
		"should",
		"may",
		"might",
		"can",
		"shall",
		"this",
		"that",
		"these",
		"those",
		"i",
		"you",
		"we",
		"they",
		"he",
		"she",
		"it",
		"my",
		"your",
		"our",
		"their",
		"his",
		"her",
		"its",
		"not",
		"no",
		"as",
		"from",
		"about",
		"into",
		"through",
		"during",
		"before",
		"after",
		"above",
		"below",
		"between",
		"up",
		"down",
		"out",
		"off",
		"over",
		"under",
		"again",
		"then",
		"once",
		"all",
		"each",
		"every",
		"both",
		"few",
		"more",
		"most",
		"other",
		"some",
		"such",
		"only",
		"own",
		"same",
		"so",
		"than",
		"too",
		"very",
		"just",
		"also",
		"how",
		"what",
		"which",
		"who",
		"whom",
		"why",
		"where",
		"when",
		"if",
		"while",
		"because",
		"although",
		"per",
		"any",
		"etc",
	]);

	// Extract meaningful words from job description
	const jdWords = jobDescription
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 2 && !stopWords.has(w));

	// Count word frequency in JD
	const jdFreq = new Map<string, number>();
	jdWords.forEach((w) => jdFreq.set(w, (jdFreq.get(w) || 0) + 1));

	// Get top keywords (appearing 2+ times)
	const keywords = [...jdFreq.entries()]
		.filter(([, count]) => count >= 2)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 30)
		.map(([word]) => word);

	// Extract 2-word phrases
	const jdWordsAll = jobDescription
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/);
	const jdBigrams: string[] = [];
	for (let i = 0; i < jdWordsAll.length - 1; i++) {
		const w1 = jdWordsAll[i];
		const w2 = jdWordsAll[i + 1];
		if (
			!stopWords.has(w1) &&
			!stopWords.has(w2) &&
			w1.length > 2 &&
			w2.length > 2
		) {
			jdBigrams.push(`${w1} ${w2}`);
		}
	}
	const bigramFreq = new Map<string, number>();
	jdBigrams.forEach((b) => bigramFreq.set(b, (bigramFreq.get(b) || 0) + 1));
	const topBigrams = [...bigramFreq.entries()]
		.filter(([, count]) => count >= 2)
		.map(([phrase]) => phrase);

	const allKeywords = [...new Set([...keywords, ...topBigrams])];

	const resumeLower = resumeText.toLowerCase();
	const matched = allKeywords.filter((kw) => resumeLower.includes(kw));
	const missing = allKeywords.filter((kw) => !resumeLower.includes(kw));

	const score =
		allKeywords.length > 0
			? Math.round((matched.length / allKeywords.length) * 100)
			: 0;

	return { score, matched, missing, totalKeywords: allKeywords.length };
}

function buildResumeText(data: ResumeData): string {
	return [
		data.name,
		data.summary,
		...data.skills,
		...data.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
		...data.education.map((e) => `${e.degree} ${e.school}`),
	].join(" ");
}

/* ---------- Circular Score Ring ---------- */
function ScoreRing({ score }: { score: number }) {
	const size = 140;
	const strokeWidth = 10;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 100) * circumference;

	let color: string;
	let label: string;
	if (score >= 70) {
		color = "#22c55e";
		label = "Great Match";
	} else if (score >= 40) {
		color = "#eab308";
		label = "Needs Work";
	} else {
		color = "#ef4444";
		label = "Low Match";
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<svg width={size} height={size} className="-rotate-90">
				{/* Background track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="#e8e2da"
					strokeWidth={strokeWidth}
				/>
				{/* Progress arc */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="transition-all duration-700 ease-out"
				/>
			</svg>
			{/* Score text overlaid in center */}
			<div
				className="absolute flex flex-col items-center justify-center"
				style={{ width: size, height: size }}
			>
				<span className="text-3xl font-bold" style={{ color }}>
					{score}%
				</span>
				<span className="text-[0.7rem] font-medium text-[#6b6560]">
					ATS Score
				</span>
			</div>
			<span
				className="mt-1 rounded-full px-3 py-0.5 text-xs font-semibold"
				style={{
					color,
					backgroundColor: `${color}18`,
					border: `1px solid ${color}40`,
				}}
			>
				{label}
			</span>
		</div>
	);
}

/* ---------- Main Component ---------- */
export default function ATSChecker({
	data,
	onClose,
}: {
	data: ResumeData;
	onClose: () => void;
}) {
	const [jobDescription, setJobDescription] = useState("");
	const [result, setResult] = useState<ATSResult | null>(null);

	function handleAnalyze() {
		if (!jobDescription.trim()) return;
		const resumeText = buildResumeText(data);
		setResult(analyzeATS(resumeText, jobDescription));
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[#e8e2da] px-6 py-4">
					<h2 className="text-lg font-semibold text-[#1e2a3a]">
						ATS Compatibility Check
					</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-1.5 text-[#9a9590] transition-colors hover:bg-[#f5f0ea] hover:text-[#6b6560]"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto px-6 py-5">
					{/* Job description input */}
					<label className="mb-1.5 block text-sm font-medium text-[#4a4540]">
						Paste the job description
					</label>
					<textarea
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						rows={4}
						placeholder="Paste the full job description here..."
						className="w-full rounded-lg border border-[#d4cfc8] bg-[#faf8f5] px-3 py-2.5 text-sm text-[#1b1b1b] placeholder:text-[#b5b0a8] focus:border-[#b08d57] focus:outline-none focus:ring-1 focus:ring-[#b08d57]"
					/>
					<button
						onClick={handleAnalyze}
						disabled={!jobDescription.trim()}
						className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e2a3a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-40"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 4.532a2.25 2.25 0 01-1.986 1.218H9.456a2.25 2.25 0 01-1.986-1.218L5 14.5m14 0H5"
							/>
						</svg>
						Analyze
					</button>

					{/* Results */}
					{result && (
						<div className="mt-6 space-y-6">
							{/* Score ring */}
							<div className="flex justify-center">
								<div className="relative">
									<ScoreRing score={result.score} />
								</div>
							</div>

							<p className="text-center text-sm text-[#6b6560]">
								{result.matched.length} of {result.totalKeywords} keywords
								matched
							</p>

							{/* Matched keywords */}
							{result.matched.length > 0 && (
								<div>
									<h3 className="mb-2 text-sm font-semibold text-[#4a4540]">
										Matched Keywords
									</h3>
									<div className="flex flex-wrap gap-1.5">
										{result.matched.map((kw) => (
											<span
												key={kw}
												className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
											>
												<svg
													className="h-3 w-3"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={2}
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M4.5 12.75l6 6 9-13.5"
													/>
												</svg>
												{kw}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Missing keywords */}
							{result.missing.length > 0 && (
								<div>
									<h3 className="mb-2 text-sm font-semibold text-[#4a4540]">
										Missing Keywords
									</h3>
									<div className="flex flex-wrap gap-1.5">
										{result.missing.map((kw) => (
											<span
												key={kw}
												className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
											>
												<svg
													className="h-3 w-3"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={2}
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M12 4.5v15m7.5-7.5h-15"
													/>
												</svg>
												{kw}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Tips */}
							<div className="rounded-lg border border-[#e8e2da] bg-[#faf8f5] p-4">
								<h3 className="mb-2 text-sm font-semibold text-[#1e2a3a]">
									Tips for Improvement
								</h3>
								<ul className="space-y-1.5 text-xs text-[#6b6560]">
									{result.missing.length > 0 && (
										<li className="flex gap-2">
											<span className="mt-0.5 text-[#b08d57]">&#x2022;</span>
											Consider adding the missing keywords naturally into your
											summary, skills, or experience bullet points.
										</li>
									)}
									<li className="flex gap-2">
										<span className="mt-0.5 text-[#b08d57]">&#x2022;</span>
										Mirror the exact phrasing from the job description where it
										genuinely applies to your experience.
									</li>
									<li className="flex gap-2">
										<span className="mt-0.5 text-[#b08d57]">&#x2022;</span>
										Use standard section headings (Experience, Education,
										Skills) so ATS parsers can read your resume correctly.
									</li>
									{result.score < 40 && (
										<li className="flex gap-2">
											<span className="mt-0.5 text-[#b08d57]">&#x2022;</span>
											Your score is quite low. Focus on tailoring your resume
											specifically for this role before applying.
										</li>
									)}
									{result.score >= 70 && (
										<li className="flex gap-2">
											<span className="mt-0.5 text-[#b08d57]">&#x2022;</span>
											Great match! Double-check that all information is accurate
											and represents your real experience.
										</li>
									)}
								</ul>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
