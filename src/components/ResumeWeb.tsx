"use client";

import ShareKit from "@/components/ShareKit";
import ViewCounter from "@/components/ViewCounter";
import { SITE_URL } from "@/lib/site";
import type { ResumeData } from "@/lib/types";
import { getPalette } from "@/lib/types";

interface ResumeWebProps {
	data: ResumeData;
	slug?: string;
	isOwner?: boolean;
}

export default function ResumeWeb({ data, slug, isOwner }: ResumeWebProps) {
	const palette = getPalette(data.paletteId);

	const handlePrint = () => {
		window.print();
	};

	const scrollToExperience = (e: React.MouseEvent) => {
		e.preventDefault();
		document
			.getElementById("rw-experience")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	// Extract a short tagline from the summary (first sentence or first 160 chars)
	const tagline = data.summary
		? data.summary.length > 160
			? data.summary.slice(0, data.summary.indexOf(".", 80) + 1) ||
				data.summary.slice(0, 160) + "..."
			: data.summary
		: "";

	// Split the name for display on two lines if it has a space
	const nameParts = data.name.trim().split(/\s+/);
	const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
	const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

	// ═══════════ SOCIAL SHARING ═══════════
	const shareUrl =
		typeof window !== "undefined"
			? window.location.href
			: slug
				? `${SITE_URL}/r/${slug}`
				: SITE_URL;

	// ═══════════ JSON-LD STRUCTURED DATA ═══════════
	function cleanJsonLd(obj: Record<string, any>): Record<string, any> {
		return Object.fromEntries(
			Object.entries(obj).filter(
				([, v]) => v !== undefined && v !== null && v !== "",
			),
		);
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						cleanJsonLd({
							"@context": "https://schema.org",
							"@type": "Person",
							name: data.name,
							jobTitle: data.experience?.[0]?.title || undefined,
							worksFor: data.experience?.[0]?.company
								? { "@type": "Organization", name: data.experience[0].company }
								: undefined,
							address: data.location
								? { "@type": "PostalAddress", addressLocality: data.location }
								: undefined,
							email: data.email || undefined,
							telephone: data.phone || undefined,
							knowsLanguage: data.languages?.map((l) => l.name) || undefined,
							knowsAbout: data.skills || undefined,
							description: data.summary || undefined,
							url: slug ? `${SITE_URL}/r/${slug}` : undefined,
						}),
					).replace(/</g, "\\u003c"),
				}}
			/>
			<style jsx global>{`
        /* ═══════════════════════════════════════════
           KAVORA RESUME WEB VIEW
           ═══════════════════════════════════════════ */
        :root {
          --rw-ink: var(--color-ink, oklch(24% 0.028 250));
          --rw-warm-white: var(--color-paper, oklch(97.5% 0.006 250));
          --rw-cream: var(--color-paper-2, oklch(94.5% 0.008 250));
          --rw-slate: var(--color-ink-2, oklch(42% 0.02 250));
          --rw-muted: var(--color-ink-2, oklch(42% 0.02 250));
          --rw-accent: ${palette.accent};
          --rw-accent-light: ${palette.accent}cc;
          --rw-accent-glow: ${palette.accent}1f;
          --rw-navy: ${palette.primary};
          --rw-navy-soft: ${palette.headerBg};
          --rw-display:
            var(--font-cormorant), "Cormorant Garamond", Georgia, serif;
          --rw-body: var(--font-dm-sans), "DM Sans", -apple-system, sans-serif;
          --rw-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rw-root {
          font-family: var(--rw-body);
          color: var(--rw-ink);
          background: var(--rw-warm-white);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        /* ═══════════ HERO ═══════════ */
        .rw-hero {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: stretch;
          position: relative;
          padding: clamp(3rem, 8vw, 5rem) clamp(1rem, 3.5vw, 3rem);
          border-bottom: 1px solid
            color-mix(in oklch, var(--rw-ink) 12%, transparent);
        }

        .rw-hero-content {
          position: relative;
          z-index: 1;
          text-align: left;
          max-width: 40rem;
        }

        .rw-hero-label {
          font-family: var(--rw-body);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--rw-accent);
          margin-bottom: 1rem;
        }

        .rw-hero-name {
          font-family: var(--rw-display);
          font-size: clamp(2.75rem, 7vw, 5rem);
          font-weight: 600;
          font-style: normal;
          line-height: 1.05;
          color: var(--rw-ink);
          letter-spacing: -0.02em;
        }

        .rw-hero-line {
          width: 60px;
          height: 2px;
          background: var(--rw-accent);
          margin: 1.5rem 0;
        }

        .rw-hero-tagline {
          font-family: var(--rw-body);
          font-size: clamp(1rem, 2vw, 1.125rem);
          font-style: normal;
          color: var(--rw-slate);
          line-height: 1.65;
          max-width: 36rem;
          margin: 0;
        }

        .rw-hero-contact {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 1rem 1.5rem;
          margin-top: 1.75rem;
          flex-wrap: wrap;
        }

        .rw-hero-contact a,
        .rw-hero-contact span {
          font-size: 0.82rem;
          color: var(--rw-muted);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }

        .rw-hero-contact a:hover {
          color: var(--rw-accent);
        }

        .rw-dot {
          width: 3px;
          height: 3px;
          background: var(--rw-accent);
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .rw-hero-actions {
          margin-top: 2rem;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .rw-share-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .rw-share-label {
          font-family: var(--rw-body);
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--rw-muted);
        }

        .rw-share-kit {
          display: flex;
          justify-content: flex-start;
        }

        .rw-btn {
          font-family: var(--rw-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition:
            background-color 0.2s var(--rw-ease-out),
            color 0.2s var(--rw-ease-out);
          display: inline-block;
        }

        .rw-btn-primary {
          background: var(--rw-navy);
          color: #fff;
        }

        .rw-btn-primary:hover {
          background: var(--rw-accent);
        }

        .rw-btn-outline {
          background: transparent;
          color: var(--rw-navy);
          border: 1px solid var(--rw-navy);
        }

        .rw-btn-outline:hover {
          background: var(--rw-navy);
          color: #fff;
        }

        /* ═══════════ MAIN CONTENT ═══════════ */
        .rw-container {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 28px;
        }

        .rw-section {
          padding: 80px 0;
          position: relative;
        }

        /* ═══════════ SECTION HEADERS ═══════════ */
        .rw-section-header {
          margin-bottom: 48px;
        }

        .rw-section-number {
          font-family: var(--rw-display);
          font-size: 0.85rem;
          color: var(--rw-accent);
          letter-spacing: 3px;
          margin-bottom: 8px;
          display: block;
        }

        .rw-section-title {
          font-family: var(--rw-display);
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          font-weight: 700;
          color: var(--rw-ink);
          line-height: 1.15;
        }

        .rw-section-line {
          width: 40px;
          height: 2px;
          background: var(--rw-accent);
          margin-top: 16px;
        }

        /* ═══════════ COMPETENCIES ═══════════ */
        .rw-competencies {
          background: var(--rw-cream);
          padding: 80px 0;
        }

        .rw-skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .rw-skill-chip {
          font-family: var(--rw-body);
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--rw-navy);
          background: var(--rw-warm-white);
          padding: 10px 20px;
          border: 1px solid ${palette.primary}14;
          transition: all 0.4s var(--rw-ease-out);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .rw-skill-chip::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--rw-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s var(--rw-ease-out);
        }

        .rw-skill-chip:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
          border-color: var(--rw-accent-light);
        }

        .rw-skill-chip:hover::before {
          transform: scaleX(1);
        }

        /* ═══════════ EXPERIENCE ═══════════ */
        .rw-experience-item {
          position: relative;
          padding-left: 32px;
          margin-bottom: 52px;
        }

        .rw-experience-item:last-child {
          margin-bottom: 0;
        }

        .rw-experience-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          width: 8px;
          height: 8px;
          background: var(--rw-accent);
          border-radius: 50%;
        }

        .rw-experience-item::after {
          content: "";
          position: absolute;
          left: 3.5px;
          top: 24px;
          width: 1px;
          height: calc(100% + 28px);
          background: linear-gradient(
            to bottom,
            var(--rw-accent-light),
            transparent
          );
        }

        .rw-experience-item:last-child::after {
          display: none;
        }

        .rw-exp-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 4px;
        }

        .rw-exp-title {
          font-family: var(--rw-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--rw-ink);
        }

        .rw-exp-dates {
          font-family: var(--rw-body);
          font-size: 0.72rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--rw-accent);
          font-weight: 500;
          white-space: nowrap;
        }

        .rw-exp-company {
          font-family: var(--rw-body);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--rw-navy-soft);
          margin-bottom: 14px;
        }

        .rw-exp-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .rw-exp-bullets li {
          font-size: 0.9rem;
          color: var(--rw-slate);
          line-height: 1.7;
          margin-bottom: 6px;
          padding-left: 18px;
          position: relative;
        }

        .rw-exp-bullets li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          width: 6px;
          height: 1px;
          background: var(--rw-accent);
        }

        /* ═══════════ BOTTOM SECTION ═══════════ */
        .rw-bottom {
          background: var(--rw-navy);
          color: #fff;
          padding: 80px 0;
        }

        .rw-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 48px;
        }

        .rw-bottom-col-title {
          font-family: var(--rw-body);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--rw-accent-light);
          margin-bottom: 24px;
        }

        .rw-edu-entry {
          margin-bottom: 18px;
        }

        .rw-edu-name {
          font-family: var(--rw-display);
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.35;
        }

        .rw-edu-school {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 2px;
        }

        .rw-vol-item {
          font-family: var(--rw-display);
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .rw-lang-item {
          font-family: var(--rw-display);
          font-size: 1.05rem;
          color: #fff;
          margin-bottom: 8px;
        }

        .rw-lang-level {
          font-family: var(--rw-body);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ═══════════ FOOTER ═══════════ */
        .rw-footer {
          background: var(--rw-ink);
          padding: 32px 0;
          text-align: center;
        }

        .rw-footer p {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 1px;
        }

        .rw-footer a {
          color: rgba(255, 255, 255, 0.45);
          text-decoration: none;
          transition: color 0.3s;
        }

        .rw-footer a:hover {
          color: var(--rw-accent-light);
        }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width: 768px) {
          .rw-section {
            padding: 56px 0;
          }
          .rw-competencies {
            padding: 56px 0;
          }
          .rw-bottom-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .rw-hero-contact {
            gap: 12px;
          }
          .rw-hero-contact .rw-dot {
            display: none;
          }
          .rw-hero-contact a,
          .rw-hero-contact span {
            display: block;
            text-align: center;
          }
          .rw-exp-header {
            flex-direction: column;
            gap: 2px;
          }
          .rw-experience-item {
            padding-left: 24px;
          }
        }

        @media (max-width: 480px) {
          .rw-container {
            padding: 0 20px;
          }
          .rw-hero {
            padding: 40px 20px;
          }
          .rw-hero-actions {
            flex-direction: column;
            align-items: center;
          }
          .rw-btn {
            width: 100%;
            text-align: center;
            max-width: 280px;
          }
          .rw-share-row {
            justify-content: center;
          }
        }

        /* ═══════════ PRINT ═══════════ */
        @media print {
          .rw-root::before {
            display: none;
          }
          .rw-hero {
            min-height: auto;
            padding: 40px 24px;
          }
          .rw-hero-actions {
            display: none;
          }
          .rw-share-row {
            display: none;
          }
          .rw-section {
            padding: 32px 0;
          }
          .rw-competencies {
            padding: 32px 0;
          }
          .rw-bottom {
            background: ${palette.headerBg};
          }
          .rw-footer {
            display: none;
          }
        }
      `}</style>

			<div className="rw-root">
				{/* ═══════════ TOP NAV ═══════════ */}
				<nav
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						zIndex: 100,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "14px 28px",
						background: "rgba(250, 248, 245, 0.85)",
						backdropFilter: "blur(12px)",
						WebkitBackdropFilter: "blur(12px)",
						borderBottom: "1px solid rgba(0,0,0,0.04)",
					}}
				>
					<a
						href="/"
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							textDecoration: "none",
							color: palette.primary,
							fontSize: "0.8rem",
							fontWeight: 600,
							letterSpacing: "0.03em",
						}}
					>
						<img
							src="/kavora-logo.png"
							alt=""
							style={{ width: 22, height: "auto" }}
						/>
						Kavora Resume Builder
					</a>
					{isOwner && (
						<a
							href={`/create?edit=${data.slug}`}
							style={{
								fontSize: "0.75rem",
								fontWeight: 500,
								letterSpacing: "0.05em",
								textDecoration: "none",
								color: "var(--color-ink-2, oklch(42% 0.02 250))",
								transition: "color 0.3s ease",
							}}
						>
							Edit Resume
						</a>
					)}
					<a
						href="/create"
						style={{
							fontSize: "0.75rem",
							fontWeight: 500,
							letterSpacing: "0.08em",
							textTransform: "uppercase" as const,
							textDecoration: "none",
							color: palette.accent,
							padding: "8px 18px",
							border: `1px solid ${palette.accent}`,
							borderRadius: 2,
							transition: "all 0.3s ease",
						}}
					>
						Create Yours
					</a>
				</nav>

				{/* ═══════════ HERO ═══════════ */}
				<header className="rw-hero">
					<div className="rw-hero-content">
						{data.photo && (
							<div
								style={{
									width: 96,
									height: 96,
									borderRadius: 2,
									overflow: "hidden",
									border: `1px solid ${palette.accent}`,
									marginBottom: 20,
									display: "block",
								}}
							>
								<img
									src={data.photo}
									alt={data.name}
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							</div>
						)}
						<div className="rw-hero-label">Resume</div>
						<h1 className="rw-hero-name">
							{lastName ? (
								<>
									{firstName}
									<br />
									{lastName}
								</>
							) : (
								firstName
							)}
						</h1>
						<div className="rw-hero-line" />
						{tagline && <p className="rw-hero-tagline">{tagline}</p>}
						<div className="rw-hero-contact">
							{data.location && <span>{data.location}</span>}
							{data.location && data.phone && <span className="rw-dot" />}
							{data.phone && (
								<a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`}>
									{data.phone}
								</a>
							)}
							{(data.location || data.phone) && data.email && (
								<span className="rw-dot" />
							)}
							{data.email && <a href={`mailto:${data.email}`}>{data.email}</a>}
						</div>
						<div className="rw-hero-actions">
							<button
								onClick={handlePrint}
								className="rw-btn rw-btn-primary"
								type="button"
							>
								Download Resume
							</button>
							{data.experience.length > 0 && (
								<a
									href="#rw-experience"
									className="rw-btn rw-btn-outline"
									onClick={scrollToExperience}
								>
									View Experience
								</a>
							)}
						</div>
						<div className="rw-share-row">
							<span className="rw-share-label">Share</span>
							<div className="rw-share-kit">
								<ShareKit url={shareUrl} name={data.name} compact showQr />
							</div>
						</div>
					</div>
				</header>

				{/* ═══════════ CORE COMPETENCIES ═══════════ */}
				{data.skills.length > 0 && (
					<section className="rw-competencies" id="rw-competencies">
						<div className="rw-container">
							<div className="rw-section-header">
								<span className="rw-section-number">01</span>
								<h2 className="rw-section-title">Core Competencies</h2>
								<div className="rw-section-line" />
							</div>
							<div className="rw-skills-grid">
								{data.skills.map((skill, i) => (
									<div key={i} className="rw-skill-chip">
										{skill}
									</div>
								))}
							</div>
						</div>
					</section>
				)}

				{/* ═══════════ PROFESSIONAL EXPERIENCE ═══════════ */}
				{data.experience.length > 0 && (
					<section className="rw-section" id="rw-experience">
						<div className="rw-container">
							<div className="rw-section-header">
								<span className="rw-section-number">
									{data.skills.length > 0 ? "02" : "01"}
								</span>
								<h2 className="rw-section-title">Professional Experience</h2>
								<div className="rw-section-line" />
							</div>

							{data.experience.map((exp) => (
								<div key={exp.id} className="rw-experience-item">
									<div className="rw-exp-header">
										<span className="rw-exp-title">{exp.title}</span>
										<span className="rw-exp-dates">
											{exp.startDate}
											{exp.endDate ? ` \u2013 ${exp.endDate}` : ""}
										</span>
									</div>
									<div className="rw-exp-company">
										{exp.company}
										{exp.location ? ` \u2014 ${exp.location}` : ""}
									</div>
									{exp.bullets.length > 0 && (
										<ul className="rw-exp-bullets">
											{exp.bullets.map((bullet, j) => (
												<li key={j}>{bullet}</li>
											))}
										</ul>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* ═══════════ EDUCATION / VOLUNTEER / LANGUAGES ═══════════ */}
				{(data.education.length > 0 ||
					data.volunteer.length > 0 ||
					data.languages.length > 0) && (
					<section className="rw-bottom">
						<div className="rw-container">
							<div className="rw-bottom-grid">
								{data.education.length > 0 && (
									<div>
										<div className="rw-bottom-col-title">Education</div>
										{data.education.map((edu) => (
											<div key={edu.id} className="rw-edu-entry">
												<div className="rw-edu-name">{edu.degree}</div>
												<div className="rw-edu-school">
													{edu.school}
													{edu.location ? ` \u2014 ${edu.location}` : ""}
												</div>
											</div>
										))}
									</div>
								)}

								{data.volunteer.length > 0 && (
									<div>
										<div className="rw-bottom-col-title">Volunteering</div>
										{data.volunteer.map((vol, i) => (
											<div key={i} className="rw-vol-item">
												{vol}
											</div>
										))}
									</div>
								)}

								{data.languages.length > 0 && (
									<div>
										<div className="rw-bottom-col-title">Languages</div>
										{data.languages.map((lang, i) => (
											<div key={i} className="rw-lang-item">
												{lang.name}{" "}
												<span className="rw-lang-level">
													&mdash; {lang.level}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{/* ═══════════ FOOTER ═══════════ */}
				<footer className="rw-footer">
					{!data.isPro && (
						<>
							<img
								src="/kavora-logo-white.png"
								alt="Kavora Systems"
								style={{
									width: 24,
									height: "auto",
									opacity: 0.6,
									marginBottom: 8,
								}}
							/>
							<p>
								Built with{" "}
								<a href="/" target="_blank" rel="noopener noreferrer">
									Kavora Resume Builder
								</a>{" "}
								&mdash; by Kavora Systems
							</p>
						</>
					)}
					{slug && <ViewCounter slug={slug} />}
				</footer>
			</div>
		</>
	);
}
