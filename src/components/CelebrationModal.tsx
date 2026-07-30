"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ShareKit from "@/components/ShareKit";

interface CelebrationModalProps {
	url: string;
	name: string;
	onClose: () => void;
	/** Set when the user picked "Resume + Portfolio" so step two stays visible. */
	emphasizePortfolio?: boolean;
}

export default function CelebrationModal({
	url,
	name,
	onClose,
	emphasizePortfolio = false,
}: CelebrationModalProps) {
	const [visible, setVisible] = useState(false);
	const [checkVisible, setCheckVisible] = useState(false);
	const [copied, setCopied] = useState(false);
	const backdropRef = useRef<HTMLDivElement>(null);

	const firstName = name.split(" ")[0] || "there";
	const portfolioSlug = url.split("/r/")[1] ?? "your-name";

	// Animate in
	useEffect(() => {
		requestAnimationFrame(() => {
			setVisible(true);
		});
		const checkTimer = setTimeout(() => setCheckVisible(true), 350);
		return () => clearTimeout(checkTimer);
	}, []);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch {
			const input = document.createElement("input");
			input.value = url;
			document.body.appendChild(input);
			input.select();
			document.execCommand("copy");
			document.body.removeChild(input);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		}
	}

	function handleBackdropClick(e: React.MouseEvent) {
		if (e.target === backdropRef.current) {
			onClose();
		}
	}

	return (
		<div
			ref={backdropRef}
			onClick={handleBackdropClick}
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{
				backgroundColor: visible ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0)",
				transition: "background-color 0.4s ease",
			}}
		>
			<div
				style={{
					opacity: visible ? 1 : 0,
					transform: visible ? "scale(1)" : "scale(0.85)",
					transition:
						"opacity 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
				}}
				className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
			>
				{/* Top section with gradient background */}
				<div
					className="flex flex-col items-center rounded-t-2xl px-6 pb-6 pt-8"
					style={{
						background:
							"linear-gradient(135deg, #faf8f5 0%, #f0ebe4 50%, #f5f0ea 100%)",
					}}
				>
					{/* Animated checkmark circle */}
					<div
						className="mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
						style={{
							opacity: checkVisible ? 1 : 0,
							transform: checkVisible ? "scale(1)" : "scale(0.3)",
							transition:
								"opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
							background: "linear-gradient(135deg, #1e2a3a 0%, #2d5a3d 100%)",
						}}
					>
						<svg
							className="h-10 w-10 text-white"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2.5}
							stroke="currentColor"
							style={{
								strokeDasharray: 30,
								strokeDashoffset: checkVisible ? 0 : 30,
								transition: "stroke-dashoffset 0.6s ease 0.2s",
							}}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4.5 12.75l6 6 9-13.5"
							/>
						</svg>
					</div>

					{/* Heading */}
					<h2
						className="mb-2 text-2xl font-semibold tracking-tight text-[#1b1b1b]"
						style={{
							fontFamily: "var(--font-cormorant), Georgia, serif",
							fontSize: "1.75rem",
						}}
					>
						Your Resume is Live!
					</h2>

					{/* Personal message */}
					<p className="text-center text-sm leading-relaxed text-[#6b6560]">
						Congratulations, {firstName}! Your professional resume is now
						published and ready to share.
					</p>
				</div>

				{/* Content section */}
				<div className="px-6 pb-6 pt-5">
					{/* URL display */}
					<div className="mb-5 rounded-lg border border-[#e8e2da] bg-[#faf8f5] px-4 py-3">
						<p
							className="truncate text-sm text-[#4a4540]"
							style={{
								fontFamily:
									"ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
							}}
						>
							{url}
						</p>
					</div>

					{/* Action buttons */}
					<div className="mb-5 flex gap-3">
						<button
							onClick={handleCopy}
							className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1e2a3a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2d3f54] active:scale-[0.98]"
						>
							{copied ? (
								<>
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
											d="M4.5 12.75l6 6 9-13.5"
										/>
									</svg>
									Copied!
								</>
							) : (
								<>
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
											d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
										/>
									</svg>
									Copy Link
								</>
							)}
						</button>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#1e2a3a] px-4 py-2.5 text-sm font-medium text-[#1e2a3a] transition-all hover:bg-[#f5f0ea] active:scale-[0.98]"
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
									d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
								/>
							</svg>
							View Resume
						</a>
					</div>

					{/* Step two: portfolio */}
					{emphasizePortfolio ? (
						<div className="mb-5 rounded-lg border border-[#b08d57]/40 bg-[#b08d57]/5 p-4">
							<p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-[#b08d57]">
								Step 2 of 2
							</p>
							<p className="mt-1.5 text-sm leading-relaxed text-[#4a4540]">
								Your resume is live. Add your projects and bio to publish the
								matching portfolio at{" "}
								<span className="font-medium text-[#1e2a3a]">
									/p/{portfolioSlug}
								</span>
								.
							</p>
							<Link
								href="/create/portfolio"
								className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#b08d57] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#9a7a4a] active:scale-[0.98]"
							>
								Set Up My Portfolio
								<span aria-hidden="true">&rarr;</span>
							</Link>
						</div>
					) : (
						<div className="mb-5 text-center">
							<Link
								href="/create/portfolio"
								className="text-[0.8125rem] font-medium text-[#b08d57] transition-colors hover:text-[#9a7a4a]"
							>
								Add a portfolio at /p/{portfolioSlug} &rarr;
							</Link>
						</div>
					)}

					{/* Share kit */}
					<div className="mb-5">
						<p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-[#9a9590]">
							Share on
						</p>
						<ShareKit url={url} name={name} compact />
					</div>

					{/* Divider */}
					<div className="mb-4 border-t border-[#e8e2da]" />

					{/* Done button */}
					<button
						onClick={onClose}
						className="w-full rounded-lg py-2.5 text-sm font-medium text-[#6b6560] transition-colors hover:bg-[#f5f0ea] hover:text-[#4a4540]"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
}
