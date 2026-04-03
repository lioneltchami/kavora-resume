import Image from "next/image";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";

function IconResume() {
	return (
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
	);
}

function IconPortfolio() {
	return (
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
	);
}

function IconATS() {
	return (
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
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			<polyline points="9 12 11 14 15 10" />
		</svg>
	);
}

function IconShare() {
	return (
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
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</svg>
	);
}

function IconAI() {
	return (
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
	);
}

function IconPrice() {
	return (
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
			<line x1="12" y1="1" x2="12" y2="23" />
			<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	);
}

const features = [
	{
		icon: <IconResume />,
		title: "Resume Builder",
		description:
			"Build a polished, ATS-optimized resume with live preview. Choose from 4 layouts and 6 color palettes.",
	},
	{
		icon: <IconPortfolio />,
		title: "Portfolio Website",
		description:
			"Get a personal portfolio page at /p/your-name. Showcase projects with images, your bio, and social links.",
	},
	{
		icon: <IconATS />,
		title: "ATS-Safe Export",
		description:
			"Download a beautifully designed PDF and a separate ATS-safe version that every parser can read perfectly.",
	},
	{
		icon: <IconShare />,
		title: "Share Anywhere",
		description:
			"Unique links for your resume (/r/name) and portfolio (/p/name). Share with recruiters or on LinkedIn.",
	},
	{
		icon: <IconAI />,
		title: "AI-Powered",
		description:
			"Generate cover letters, get AI suggestions, and import your LinkedIn profile or existing PDF resume.",
	},
	{
		icon: <IconPrice />,
		title: "One Price. Forever.",
		description:
			"Pay $19 once — every feature, unlimited resumes, your portfolio, cover letters. No subscriptions.",
	},
];

export default function LandingPage() {
	return (
		<main className="min-h-screen">
			{/* Nav bar */}
			<nav
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 50,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "14px 28px",
					background: "rgba(250, 248, 245, 0.85)",
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<Image src="/kavora-logo.png" alt="" width={22} height={19} />
					<span
						style={{
							fontSize: "0.8rem",
							fontWeight: 600,
							color: "#1e2a3a",
							letterSpacing: "0.03em",
						}}
					>
						Kavora
					</span>
				</div>
				<AuthNav />
			</nav>

			{/* Hero */}
			<section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
				{/* Subtle top decorative border */}
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

				<div className="mx-auto flex max-w-2xl flex-col items-center text-center">
					{/* Label */}
					<div className="animate-fade-in-up flex items-center gap-3">
						<Image
							src="/kavora-logo.png"
							alt="Kavora Systems"
							width={32}
							height={28}
							className="opacity-80"
						/>
						<p className="text-[0.6875rem] font-medium tracking-[0.3em] text-gold uppercase">
							By Kavora Systems
						</p>
					</div>

					{/* Decorative line */}
					<div className="decorative-line animate-fade-in-up animate-delay-1 mt-6 mb-8" />

					{/* Heading */}
					<h1 className="animate-fade-in-up animate-delay-2 font-[family-name:var(--font-cormorant)] text-5xl leading-[1.15] font-semibold tracking-[-0.01em] text-navy sm:text-6xl md:text-7xl">
						Build Your Resume
						<br />
						&amp; Portfolio
					</h1>

					{/* Subtext */}
					<p className="animate-fade-in-up animate-delay-3 mt-7 max-w-lg text-base leading-relaxed text-text-muted sm:text-lg">
						Create a polished, ATS-optimized resume and a personal portfolio
						website — showcase your work, share with one link, download as PDF.
					</p>

					{/* CTAs */}
					<div className="animate-fade-in-up animate-delay-4 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
						<Link href="/get-started" className="btn-primary">
							Get Started Free
							<span className="text-gold-light" aria-hidden="true">
								&rarr;
							</span>
						</Link>
						<Link href="/r/reena" className="btn-secondary">
							See Resume Example
						</Link>
						<Link href="/my-resumes" className="btn-secondary">
							My Resumes
						</Link>
					</div>
					<div className="animate-fade-in-up animate-delay-4 mt-4">
						<Link
							href="/p/reena"
							className="text-sm font-medium text-gold transition-colors hover:text-navy"
						>
							See Portfolio Example &rarr;
						</Link>
					</div>

					{/* Pricing link */}
					<div className="animate-fade-in animate-delay-5 mt-6">
						<Link
							href="/pricing"
							className="text-[0.8rem] font-medium tracking-[0.04em] text-text-muted/60 transition-colors hover:text-gold"
						>
							View Pricing &mdash; Pro from $19
						</Link>
					</div>
				</div>

				{/* Scroll hint */}
				<div className="animate-fade-in animate-delay-5 absolute bottom-10 flex flex-col items-center gap-2">
					<span className="text-[0.625rem] tracking-[0.25em] text-text-muted/50 uppercase">
						Scroll
					</span>
					<div className="h-8 w-px bg-gradient-to-b from-text-muted/30 to-transparent" />
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-border-light px-6 py-24 md:py-32">
				<div className="mx-auto max-w-5xl">
					<div className="mb-16 text-center">
						<p className="text-[0.6875rem] font-medium tracking-[0.3em] text-gold uppercase">
							Built for every professional
						</p>
						<h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-navy sm:text-4xl">
							Resume &amp; Portfolio. Everything You Need.
						</h2>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<div key={feature.title} className="feature-card">
								<div className="feature-icon">{feature.icon}</div>
								<h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-navy">
									{feature.title}
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-text-muted">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border-light px-6 py-12">
				<div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
					<Image
						src="/kavora-logo.png"
						alt="Kavora Systems"
						width={28}
						height={24}
						className="opacity-50"
					/>
					<p className="text-xs tracking-[0.15em] text-text-muted/60">
						&copy; 2026 Kavora Systems
					</p>
					<div style={{ display: "flex", gap: 16, marginTop: 8 }}>
						<a
							href="/privacy"
							style={{
								fontSize: "0.7rem",
								color: "rgba(107,101,96,0.5)",
								textDecoration: "none",
							}}
						>
							Privacy Policy
						</a>
						<a
							href="/terms"
							style={{
								fontSize: "0.7rem",
								color: "rgba(107,101,96,0.5)",
								textDecoration: "none",
							}}
						>
							Terms of Service
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
}
