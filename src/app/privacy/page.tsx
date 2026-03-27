import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy — Kavora Resume Builder",
	description:
		"Learn how Kavora Resume Builder collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
	return (
		<main className="min-h-screen bg-bg text-text">
			<div className="mx-auto max-w-[700px] px-6 py-16 md:py-24">
				{/* Back link */}
				<Link
					href="/"
					className="mb-12 inline-flex items-center gap-2 text-sm text-text-muted/70 transition-colors hover:text-gold"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M19 12H5" />
						<path d="M12 19l-7-7 7-7" />
					</svg>
					Back to Home
				</Link>

				{/* Title */}
				<h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold tracking-tight text-navy md:text-5xl">
					Privacy Policy
				</h1>
				<p className="mt-4 text-sm text-text-muted/70">
					Effective Date: March 27, 2026
				</p>

				<div className="mt-2 h-px w-16 bg-gold/40" />

				{/* Content */}
				<div className="mt-12 space-y-10 text-[0.9375rem] leading-relaxed text-text-muted">
					{/* 1 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							1. Introduction
						</h2>
						<p>
							Welcome to Kavora Resume Builder (&ldquo;we,&rdquo;
							&ldquo;us,&rdquo; or &ldquo;our&rdquo;), a product of Kavora
							Systems. This Privacy Policy explains how we collect, use,
							disclose, and safeguard your information when you use our website
							at{" "}
							<a
								href="https://kavora-resume.vercel.app"
								className="text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold"
							>
								kavora-resume.vercel.app
							</a>{" "}
							and our related services (collectively, the
							&ldquo;Service&rdquo;). Please read this policy carefully. By
							using the Service, you consent to the practices described herein.
						</p>
					</section>

					{/* 2 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							2. Information We Collect
						</h2>
						<p className="mb-3">
							We collect information that you provide directly and information
							that is gathered automatically when you use our Service.
						</p>
						<h3 className="mb-2 text-sm font-semibold tracking-wide text-navy/80 uppercase">
							Information You Provide
						</h3>
						<ul className="mb-4 list-disc space-y-1 pl-5">
							<li>
								<strong>Resume Data:</strong> Name, email address, phone number,
								location, work history, education, skills, and any other
								information you include in your resume or cover letter.
							</li>
							<li>
								<strong>Account Information:</strong> If you create an account
								using Google OAuth, we receive your Google account name, email
								address, and profile picture.
							</li>
							<li>
								<strong>Payment Information:</strong> When you make a purchase,
								payment details are processed directly by Stripe. We do not
								store your full credit card number.
							</li>
						</ul>
						<h3 className="mb-2 text-sm font-semibold tracking-wide text-navy/80 uppercase">
							Information Collected Automatically
						</h3>
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<strong>Usage Analytics:</strong> Pages visited, features used,
								time spent on pages, and general interaction patterns to help us
								improve the Service.
							</li>
							<li>
								<strong>Device Information:</strong> Browser type, operating
								system, and screen resolution.
							</li>
						</ul>
					</section>

					{/* 3 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							3. How We Use Your Information
						</h2>
						<ul className="list-disc space-y-1 pl-5">
							<li>
								To provide, operate, and maintain the Service, including
								generating and storing your resumes and cover letters.
							</li>
							<li>
								To power AI-driven features such as resume suggestions, content
								improvements, and ATS optimization through our AI provider.
							</li>
							<li>To process payments and manage your account.</li>
							<li>
								To communicate with you about your account, updates, and support
								requests.
							</li>
							<li>
								To analyze usage patterns and improve the Service&rsquo;s
								functionality and user experience.
							</li>
						</ul>
					</section>

					{/* 4 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							4. Data Storage
						</h2>
						<p>
							Your data is stored in a Supabase cloud database. Data is
							encrypted at rest and in transit using industry-standard
							encryption protocols. We implement appropriate technical and
							organizational measures to protect your personal information
							against unauthorized access, alteration, disclosure, or
							destruction.
						</p>
					</section>

					{/* 5 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							5. Third-Party Services
						</h2>
						<p className="mb-3">
							We use the following third-party services to operate and improve
							the Service. Each service has its own privacy policy governing its
							use of your data:
						</p>
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<strong>Supabase</strong> &mdash; Database hosting and user
								authentication.
							</li>
							<li>
								<strong>Anthropic (Claude)</strong> &mdash; AI-powered resume
								suggestions and content generation.
							</li>
							<li>
								<strong>Stripe</strong> &mdash; Payment processing.
							</li>
							<li>
								<strong>Vercel</strong> &mdash; Application hosting and
								deployment.
							</li>
						</ul>
					</section>

					{/* 6 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							6. Data Retention
						</h2>
						<p>
							We retain your personal information for as long as your account
							remains active or as needed to provide the Service to you. If you
							wish to have your data deleted, you may request deletion at any
							time by contacting us. Upon receiving a valid deletion request, we
							will remove your personal data from our systems within 30 days,
							except where retention is required by law.
						</p>
					</section>

					{/* 7 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							7. Your Rights
						</h2>
						<p className="mb-3">
							Depending on your jurisdiction, you may have the following rights
							regarding your personal data:
						</p>
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<strong>Access:</strong> Request a copy of the personal data we
								hold about you.
							</li>
							<li>
								<strong>Correction:</strong> Request that we correct inaccurate
								or incomplete data.
							</li>
							<li>
								<strong>Deletion:</strong> Request that we delete your personal
								data.
							</li>
							<li>
								<strong>Export:</strong> Request a machine-readable export of
								your data.
							</li>
						</ul>
						<p className="mt-3">
							To exercise any of these rights, please contact us at the email
							address provided below.
						</p>
					</section>

					{/* 8 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							8. Cookies
						</h2>
						<p>
							We use essential session cookies to maintain your authentication
							state and provide a secure experience. These cookies are strictly
							necessary for the Service to function and cannot be opted out of.
							We do not use advertising or third-party tracking cookies.
						</p>
					</section>

					{/* 9 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							9. Children&rsquo;s Privacy
						</h2>
						<p>
							The Service is not intended for individuals under the age of 13.
							We do not knowingly collect personal information from children
							under 13. If we become aware that we have collected data from a
							child under 13, we will take steps to delete such information
							promptly.
						</p>
					</section>

					{/* 10 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							10. Changes to This Policy
						</h2>
						<p>
							We may update this Privacy Policy from time to time. When we do,
							we will revise the &ldquo;Effective Date&rdquo; at the top of this
							page. We encourage you to review this policy periodically. Your
							continued use of the Service after changes are posted constitutes
							your acceptance of the revised policy.
						</p>
					</section>

					{/* 11 */}
					<section>
						<h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
							11. Contact Us
						</h2>
						<p>
							If you have any questions about this Privacy Policy or our data
							practices, please contact us at:
						</p>
						<p className="mt-3 font-medium text-navy">
							Kavora Systems
							<br />
							<a
								href="mailto:contact@kavorasystems.com"
								className="text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold"
							>
								contact@kavorasystems.com
							</a>
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}
