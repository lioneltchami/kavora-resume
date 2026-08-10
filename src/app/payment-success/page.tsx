"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SiteChrome from "@/components/SiteChrome";

const proUnlocked = [
	"Branding-free sharing on all resumes",
	"Cover letter generator (AI-powered)",
	"ATS compatibility checker",
	"Unlimited AI suggestions",
	"PDF resume import with AI parsing",
	"All future templates & features",
];

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
		<section className="px-[clamp(1rem,3.5vw,3rem)] py-16 md:py-24">
			<div className="max-w-xl">
				<p className="font-mono text-xs text-accent">Pro activated</p>
				<h1 className="mt-4 text-display-s text-ink">Payment successful</h1>
				<p className="mt-5 max-w-md text-base leading-relaxed text-ink-2">
					Welcome to Pro. Cover letters, ATS checker, unlimited AI, Apply Pack,
					and branding-free sharing are unlocked on your account.
				</p>

				{activation === "activating" && (
					<div className="mt-6 flex items-center gap-2 text-sm text-ink-2">
						<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rule border-t-ink" />
						Activating your Pro features…
					</div>
				)}

				{activation === "signin" && (
					<div className="mt-6 border border-rule bg-paper-2 px-5 py-3 text-sm text-ink-2">
						Your payment went through.{" "}
						<Link
							href="/login?next=%2Fcreate"
							className="font-medium text-ink underline"
						>
							Sign in
						</Link>{" "}
						to finish activating Pro on your account.
					</div>
				)}

				{activation === "pending" && (
					<div className="mt-6 border border-rule bg-paper-2 px-5 py-3 text-sm text-ink-2">
						Your payment was received and Pro is being activated. If premium
						features are still locked in a few minutes, email{" "}
						<a
							href="mailto:contact@kavorasystems.com"
							className="font-medium text-ink underline"
						>
							contact@kavorasystems.com
						</a>
						.
					</div>
				)}

				<div className="mt-10 border-t border-rule pt-8">
					<p className="font-mono text-xs text-ink-2">What&apos;s unlocked</p>
					<ul className="mt-4 flex flex-col gap-3">
						{proUnlocked.map((feature) => (
							<li
								key={feature}
								className="flex items-start gap-3 text-sm text-ink"
							>
								<span className="text-accent" aria-hidden>
									—
								</span>
								<span>{feature}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
					{slug && (
						<Link href={`/r/${slug}`} className="btn-primary">
							View your resume →
						</Link>
					)}
					<Link href="/create" className="btn-secondary">
						{slug ? "Edit resume" : "Create a resume"}
					</Link>
				</div>

				<Link
					href="/my-resumes"
					className="mt-6 inline-block text-sm text-ink-2 transition-colors hover:text-accent"
				>
					Go to my resumes
				</Link>
			</div>
		</section>
	);
}

export default function PaymentSuccessPage() {
	return (
		<SiteChrome backHref="/create" backLabel="← Editor">
			<Suspense
				fallback={
					<div className="flex items-center justify-center px-[clamp(1rem,3.5vw,3rem)] py-24">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-ink" />
					</div>
				}
			>
				<SuccessContent />
			</Suspense>
		</SiteChrome>
	);
}
