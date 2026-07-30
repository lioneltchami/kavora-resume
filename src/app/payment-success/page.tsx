"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const proUnlocked = [
	"Branding-free sharing on all resumes",
	"Cover letter generator (AI-powered)",
	"ATS compatibility checker",
	"Unlimited AI suggestions",
	"PDF resume import with AI parsing",
	"All future templates & features",
];

function GoldCheck() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#b08d57"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0"
			aria-hidden="true"
		>
			<path d="M20 6L9 17l-5-5" />
		</svg>
	);
}

type ActivationState = "activating" | "active" | "pending" | "signin";

function SuccessContent() {
	const searchParams = useSearchParams();
	const slug = searchParams.get("slug");
	const sessionId = searchParams.get("session_id");
	const [activation, setActivation] = useState<ActivationState>(
		sessionId ? "activating" : "active",
	);

	// Confirms Pro directly with Stripe so access never depends on the webhook
	// having been delivered.
	useEffect(() => {
		if (!sessionId) return;

		let cancelled = false;

		fetch("/api/claim-pro", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ session_id: sessionId }),
		})
			.then(async (res) => {
				if (cancelled) return;
				if (res.ok) {
					setActivation("active");
				} else if (res.status === 401) {
					setActivation("signin");
				} else {
					setActivation("pending");
				}
			})
			.catch(() => {
				if (!cancelled) setActivation("pending");
			});

		return () => {
			cancelled = true;
		};
	}, [sessionId]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
			{/* Success icon */}
			<div className="animate-fade-in-up flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/30 bg-gold/5">
				<svg
					width="36"
					height="36"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#b08d57"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M20 6L9 17l-5-5" />
				</svg>
			</div>

			{/* Heading */}
			<h1 className="animate-fade-in-up animate-delay-1 mt-8 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy sm:text-5xl">
				Payment Successful
			</h1>

			<div className="decorative-line animate-fade-in-up animate-delay-2 mt-6 mb-6" />

			<p className="animate-fade-in-up animate-delay-2 max-w-md text-center text-base leading-relaxed text-text-muted">
				Welcome to Pro! All premium features are now active across all your
				resumes — cover letters, ATS checker, unlimited AI suggestions, and
				branding-free sharing.
			</p>

			{activation === "activating" && (
				<div className="animate-fade-in mt-6 flex items-center gap-2 text-sm text-text-muted">
					<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gold" />
					Activating your Pro features...
				</div>
			)}

			{activation === "signin" && (
				<div className="animate-fade-in mt-6 max-w-md rounded-sm border border-gold/30 bg-gold/5 px-5 py-3 text-center text-sm text-[#4a4540]">
					Your payment went through.{" "}
					<Link
						href="/login?next=%2Fcreate"
						className="font-medium text-gold underline"
					>
						Sign in
					</Link>{" "}
					to finish activating Pro on your account.
				</div>
			)}

			{activation === "pending" && (
				<div className="animate-fade-in mt-6 max-w-md rounded-sm border border-gold/30 bg-gold/5 px-5 py-3 text-center text-sm text-[#4a4540]">
					Your payment was received and Pro is being activated. If premium
					features are still locked in a few minutes, email{" "}
					<a
						href="mailto:contact@kavorasystems.com"
						className="font-medium text-gold underline"
					>
						contact@kavorasystems.com
					</a>{" "}
					and we&apos;ll switch it on right away.
				</div>
			)}

			{/* What's unlocked */}
			<div className="animate-fade-in-up animate-delay-3 mt-10 w-full max-w-sm rounded-sm border border-gold/20 bg-gold/[0.03] p-6">
				<p className="text-[0.6875rem] font-semibold tracking-[0.25em] text-gold uppercase">
					What&apos;s unlocked
				</p>
				<ul className="mt-4 flex flex-col gap-3">
					{proUnlocked.map((feature) => (
						<li
							key={feature}
							className="flex items-start gap-3 text-sm text-[#4a4540]"
						>
							<GoldCheck />
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</div>

			{/* Actions */}
			<div className="animate-fade-in-up animate-delay-4 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
				{slug && (
					<Link href={`/r/${slug}`} className="btn-primary">
						View Your Resume
						<span className="text-gold-light" aria-hidden="true">
							&rarr;
						</span>
					</Link>
				)}
				<Link href="/create" className="btn-secondary">
					{slug ? "Edit Resume" : "Create a Resume"}
				</Link>
			</div>

			<Link
				href="/my-resumes"
				className="animate-fade-in-up animate-delay-4 mt-4 text-sm font-medium text-[#6b6560] transition-colors hover:text-[#b08d57]"
			>
				Go to My Resumes
			</Link>

			{/* Footer */}
			<footer className="absolute bottom-8 flex flex-col items-center gap-3">
				<Image
					src="/kavora-logo.png"
					alt="Kavora Systems"
					width={22}
					height={19}
					className="opacity-40"
				/>
				<p className="text-[0.625rem] tracking-[0.12em] text-text-muted/40">
					&copy; 2026 Kavora Systems
				</p>
			</footer>
		</main>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
				</div>
			}
		>
			<SuccessContent />
		</Suspense>
	);
}
