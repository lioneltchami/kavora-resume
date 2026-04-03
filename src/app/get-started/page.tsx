import Image from "next/image";
import Link from "next/link";

export const metadata = {
	title: "Get Started — Kavora",
	description:
		"Choose how you'd like to build your professional presence. Start with a resume, a portfolio, or both.",
};

export default function GetStartedPage() {
	return (
		<main className="min-h-screen bg-bg flex flex-col">
			{/* Nav */}
			<nav className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-white/80 backdrop-blur-sm">
				<Link href="/" className="flex items-center gap-2">
					<Image src="/kavora-logo.png" alt="Kavora" width={22} height={19} />
					<span className="text-[0.8rem] font-semibold tracking-[0.03em] text-navy">
						Kavora
					</span>
				</Link>
				<Link
					href="/"
					className="text-[0.75rem] text-text-muted hover:text-navy transition-colors"
				>
					← Back to home
				</Link>
			</nav>

			{/* Content */}
			<div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
				{/* Header */}
				<div className="text-center mb-12">
					<p className="text-[0.6875rem] font-medium tracking-[0.3em] text-gold uppercase">
						Choose Your Path
					</p>
					<div className="decorative-line mx-auto mt-4 mb-6" />
					<h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-navy sm:text-5xl">
						What would you like to build?
					</h1>
					<p className="mt-4 text-base text-text-muted max-w-md mx-auto leading-relaxed">
						Start with what you need. You can always add the other later — both
						are included in your free account.
					</p>
				</div>

				{/* Cards */}
				<div className="grid gap-5 w-full max-w-4xl sm:grid-cols-3">
					{/* Resume Only */}
					<Link
						href="/create"
						className="group relative flex flex-col rounded-sm border border-border-light bg-white/70 p-7 transition-all duration-300 hover:border-navy/40 hover:bg-white hover:shadow-lg cursor-pointer"
					>
						{/* Icon */}
						<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-border-light bg-bg text-text-muted group-hover:border-navy/30 group-hover:text-navy transition-colors">
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
						</div>

						<h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-navy">
							Resume Only
						</h2>
						<p className="mt-2 text-sm text-text-muted leading-relaxed">
							Build a polished, ATS-optimized resume. Download as PDF, share
							with a unique link.
						</p>

						<ul className="mt-5 flex flex-col gap-2">
							{[
								"Live preview as you type",
								"4 layouts · 6 color palettes",
								"ATS-Safe PDF download",
								"Share at /r/your-name",
							].map((item) => (
								<li
									key={item}
									className="flex items-center gap-2 text-[0.8rem] text-text-muted"
								>
									<span className="text-navy/40">—</span>
									{item}
								</li>
							))}
						</ul>

						<div className="mt-8 flex items-center gap-1.5 text-[0.8125rem] font-medium text-navy group-hover:text-navy transition-colors">
							Start building
							<svg
								className="h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
								/>
							</svg>
						</div>
					</Link>

					{/* Resume + Portfolio — RECOMMENDED */}
					<Link
						href="/create"
						className="group relative flex flex-col rounded-sm border-2 border-gold/50 bg-white p-7 shadow-sm transition-all duration-300 hover:border-gold hover:shadow-xl cursor-pointer"
					>
						{/* Recommended badge */}
						<div className="absolute -top-3 left-6 rounded-sm bg-gold px-3 py-0.5 text-[0.6875rem] font-semibold tracking-[0.15em] text-white uppercase">
							Recommended
						</div>

						{/* Icon */}
						<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-gold/30 bg-gold/5 text-gold">
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
						</div>

						<h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-navy">
							Resume + Portfolio
						</h2>
						<p className="mt-2 text-sm text-text-muted leading-relaxed">
							The complete professional package. Build your resume, then launch
							your portfolio — both free to start.
						</p>

						<ul className="mt-5 flex flex-col gap-2">
							{[
								"Everything in Resume Only",
								"Portfolio at /p/your-name",
								"Projects with images",
								"Bio, social links & contact form",
							].map((item) => (
								<li
									key={item}
									className="flex items-center gap-2 text-[0.8rem] text-text-muted"
								>
									<span className="text-gold">✓</span>
									{item}
								</li>
							))}
						</ul>

						<div className="mt-8 flex items-center gap-1.5 text-[0.8125rem] font-medium text-gold group-hover:text-gold/80 transition-colors">
							Build both
							<svg
								className="h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
								/>
							</svg>
						</div>
					</Link>

					{/* Portfolio Only */}
					<Link
						href="/create/portfolio"
						className="group relative flex flex-col rounded-sm border border-border-light bg-white/70 p-7 transition-all duration-300 hover:border-navy/40 hover:bg-white hover:shadow-lg cursor-pointer"
					>
						{/* Icon */}
						<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-border-light bg-bg text-text-muted group-hover:border-navy/30 group-hover:text-navy transition-colors">
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="2" y1="12" x2="22" y2="12" />
								<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
							</svg>
						</div>

						<h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-navy">
							Portfolio Only
						</h2>
						<p className="mt-2 text-sm text-text-muted leading-relaxed">
							Skip the resume. Launch a personal portfolio page to showcase your
							projects and get discovered.
						</p>

						<ul className="mt-5 flex flex-col gap-2">
							{[
								"Portfolio at /p/your-name",
								"Up to 3 projects (free)",
								"Bio, avatar & social links",
								"Add resume any time",
							].map((item) => (
								<li
									key={item}
									className="flex items-center gap-2 text-[0.8rem] text-text-muted"
								>
									<span className="text-navy/40">—</span>
									{item}
								</li>
							))}
						</ul>

						<div className="mt-8 flex items-center gap-1.5 text-[0.8125rem] font-medium text-navy group-hover:text-navy transition-colors">
							Create portfolio
							<svg
								className="h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
								/>
							</svg>
						</div>
					</Link>
				</div>

				{/* Bottom note */}
				<p className="mt-10 text-[0.75rem] text-text-muted/60 text-center">
					All features are free to start. No credit card required.{" "}
					<Link
						href="/pricing"
						className="underline hover:text-gold transition-colors"
					>
						See what Pro unlocks →
					</Link>
				</p>
			</div>
		</main>
	);
}
