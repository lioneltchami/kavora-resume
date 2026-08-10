import Link from "next/link";
import HeroCTAs from "@/components/HeroCTAs";
import SiteChrome from "@/components/SiteChrome";

const leadFeature = {
	title: "Resume + portfolio on one slug",
	description:
		"Publish /r/you and /p/you from the same account. Tailor for a job, share, download PDF — free to start.",
};

const features = [
	{
		title: "ATS-safe export",
		description:
			"Designed PDF plus a parser-friendly ATS version — both from one resume.",
	},
	{
		title: "Job targeting",
		description:
			"Paste a JD, save a labeled copy, generate cover letter and Apply Pack ZIP.",
	},
	{
		title: "Share kit",
		description:
			"WhatsApp, LinkedIn, email, copy link, QR — on publish and on the public page.",
	},
	{
		title: "One price",
		description:
			"Free to start. Pro is $19 once — no subscription, no per-resume fee.",
	},
];

export default function LandingPage() {
	return (
		<SiteChrome>
			{/* Marquee fold — brand only */}
			<section className="marquee-fold" aria-label="Hero">
				<h1 className="marquee-brand">Kavora</h1>
			</section>

			<hr className="rule-thick w-full" />

			{/* Below fold — line + CTA + proof */}
			<section className="px-[clamp(1rem,3.5vw,3rem)] py-12 md:py-16">
				<p className="marquee-line mb-8">Resume &amp; portfolio. One link.</p>
				<div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
					<div>
						<p className="max-w-md text-base leading-relaxed text-ink-2 md:text-lg">
							Build an ATS-ready resume and a personal portfolio. Share with
							recruiters, tailor for a job, download PDF — free to start.
						</p>
						<div className="mt-8">
							<HeroCTAs />
						</div>
						<p className="mt-6 text-sm text-ink-2">
							<Link
								href="/pricing"
								className="text-ink no-underline border-b border-rule hover:border-accent hover:text-accent"
							>
								Pro from $19 one-time
							</Link>
						</p>
					</div>

					<aside
						className="border border-rule bg-paper-2 p-6 md:p-8"
						aria-label="What you get"
					>
						<p className="font-mono text-xs text-ink-2">kavoraresume.cv</p>
						<ul className="mt-6 space-y-4">
							<li className="border-b border-rule pb-4">
								<p className="font-mono text-xs text-accent">/r/you</p>
								<p className="mt-1 text-sm text-ink">Public resume page</p>
							</li>
							<li className="border-b border-rule pb-4">
								<p className="font-mono text-xs text-accent">/p/you</p>
								<p className="mt-1 text-sm text-ink">Portfolio with contact</p>
							</li>
							<li>
								<p className="font-mono text-xs text-accent">Apply Pack</p>
								<p className="mt-1 text-sm text-ink">
									Resume PDF + letter + share link (Pro)
								</p>
							</li>
						</ul>
						<div className="mt-8">
							<Link href="/r/reena" className="btn-secondary">
								See resume example →
							</Link>
						</div>
					</aside>
				</div>
			</section>

			{/* Features — lead row + four supporting */}
			<section className="px-[clamp(1rem,3.5vw,3rem)] py-16 md:py-24">
				<div>
					<h2 className="text-display-s max-w-[18ch] text-ink">
						Everything to get hired.
					</h2>
					<div className="mt-12">
						<article className="feature-row feature-row--lead">
							<h3 className="feature-row__title">{leadFeature.title}</h3>
							<p className="feature-row__body">{leadFeature.description}</p>
						</article>
						{features.map((feature) => (
							<div key={feature.title} className="feature-row">
								<h3 className="feature-row__title">{feature.title}</h3>
								<p className="feature-row__body">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="border-t border-rule px-[clamp(1rem,3.5vw,3rem)] py-16">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-display-s text-ink">Start free.</h2>
						<p className="mt-3 max-w-sm text-sm text-ink-2">
							No card required. Upgrade to Pro when you need AI, Apply Pack, or
							unlimited portfolio projects.
						</p>
					</div>
					<Link href="/get-started" className="btn-primary shrink-0">
						Get started
					</Link>
				</div>
			</section>
		</SiteChrome>
	);
}
