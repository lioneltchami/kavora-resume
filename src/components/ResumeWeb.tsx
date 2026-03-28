"use client";

import { useEffect, useRef, useState } from "react";
import ViewCounter from "@/components/ViewCounter";
import type { ResumeData } from "@/lib/types";
import { getPalette } from "@/lib/types";

interface ResumeWebProps {
	data: ResumeData;
	slug?: string;
	isOwner?: boolean;
}

export default function ResumeWeb({ data, slug, isOwner }: ResumeWebProps) {
	const palette = getPalette(data.paletteId);
	const revealRefs = useRef<HTMLElement[]>([]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("rw-visible");
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
		);

		revealRefs.current.forEach((el) => {
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	}, []);

	const addRevealRef = (el: HTMLElement | null) => {
		if (el && !revealRefs.current.includes(el)) {
			revealRefs.current.push(el);
		}
	};

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
	const getShareUrl = () =>
		typeof window !== "undefined" ? window.location.href : "";
	const shareTitle = `${data.name}'s Resume`;

	const shareLinkedIn = () => {
		window.open(
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`,
			"_blank",
		);
	};

	const shareWhatsApp = () => {
		window.open(
			`https://wa.me/?text=${encodeURIComponent(`Check out ${data.name}'s resume: ${getShareUrl()}`)}`,
			"_blank",
		);
	};

	const shareTwitter = () => {
		window.open(
			`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${data.name}'s resume`)}&url=${encodeURIComponent(getShareUrl())}`,
			"_blank",
		);
	};

	const shareEmail = () => {
		window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`I'd like to share my resume with you: ${getShareUrl()}`)}`;
	};

	const [linkCopied, setLinkCopied] = useState(false);
	const copyLink = async () => {
		await navigator.clipboard.writeText(getShareUrl());
		setLinkCopied(true);
		setTimeout(() => setLinkCopied(false), 2000);
	};

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
							url: slug
								? `https://kavora-resume.vercel.app/r/${slug}`
								: undefined,
						}),
					).replace(/</g, "\\u003c"),
				}}
			/>
			<style jsx global>{`
        /* ═══════════════════════════════════════════
           KAVORA RESUME WEB VIEW
           ═══════════════════════════════════════════ */
        :root {
          --rw-ink: #1b1b1b;
          --rw-warm-white: #faf8f5;
          --rw-cream: #f3efe8;
          --rw-slate: #4a4a4a;
          --rw-muted: #7a7a7a;
          --rw-accent: ${palette.accent};
          --rw-accent-light: ${palette.accent}cc;
          --rw-accent-glow: ${palette.accent}1f;
          --rw-navy: ${palette.primary};
          --rw-navy-soft: ${palette.headerBg};
          --rw-display:
            var(--font-cormorant), "Cormorant Garamond", Georgia, serif;
          --rw-body: var(--font-dm-sans), "DM Sans", -apple-system, sans-serif;
          --rw-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
          --rw-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
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

        /* Noise texture overlay */
        .rw-root::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
        }

        /* ═══════════ HERO ═══════════ */
        .rw-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 60px 24px;
          overflow: hidden;
        }

        .rw-hero::before {
          content: "";
          position: absolute;
          top: -20%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(
            circle,
            var(--rw-accent-glow) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: rw-float 8s ease-in-out infinite;
        }

        .rw-hero::after {
          content: "";
          position: absolute;
          bottom: -15%;
          left: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            ${palette.primary}0a 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: rw-float 10s ease-in-out infinite reverse;
        }

        /* Third floating orb */
        .rw-orb-3 {
          position: absolute;
          top: 40%;
          left: 15%;
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            ${palette.accent}0f 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: rw-float 12s ease-in-out infinite 2s;
          pointer-events: none;
        }

        @keyframes rw-float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, -30px);
          }
        }

        .rw-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 720px;
        }

        .rw-hero-label {
          font-family: var(--rw-body);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--rw-accent);
          margin-bottom: 20px;
          opacity: 0;
          transform: translateY(20px);
          animation: rw-fadeUp 0.8s var(--rw-ease-out) 0.2s forwards;
        }

        .rw-hero-name {
          font-family: var(--rw-display);
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          line-height: 1.05;
          color: var(--rw-ink);
          letter-spacing: -1px;
          opacity: 0;
          transform: translateY(30px);
          animation: rw-fadeUp 1s var(--rw-ease-out) 0.4s forwards;
        }

        .rw-hero-line {
          width: 60px;
          height: 2px;
          background: var(--rw-accent);
          margin: 28px auto;
          opacity: 0;
          transform: scaleX(0);
          animation: rw-lineReveal 0.8s var(--rw-ease-out) 0.8s forwards;
        }

        @keyframes rw-lineReveal {
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        .rw-hero-tagline {
          font-family: var(--rw-display);
          font-size: clamp(1.05rem, 2.5vw, 1.3rem);
          font-style: italic;
          color: var(--rw-slate);
          line-height: 1.65;
          max-width: 560px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          animation: rw-fadeUp 0.8s var(--rw-ease-out) 1s forwards;
        }

        .rw-hero-contact {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 28px;
          margin-top: 36px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(20px);
          animation: rw-fadeUp 0.8s var(--rw-ease-out) 1.2s forwards;
        }

        .rw-hero-contact a,
        .rw-hero-contact span {
          font-size: 0.82rem;
          color: var(--rw-muted);
          text-decoration: none;
          letter-spacing: 0.5px;
          transition: color 0.3s;
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
          margin-top: 44px;
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(20px);
          animation: rw-fadeUp 0.8s var(--rw-ease-out) 1.4s forwards;
        }

        .rw-share-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          justify-content: center;
          opacity: 0;
          animation: rw-fadeUp 0.8s var(--rw-ease-out) 1.6s forwards;
        }

        .rw-share-label {
          font-family: var(--rw-body);
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--rw-muted);
        }

        .rw-share-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.5);
          color: var(--rw-slate);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .rw-share-btn:hover {
          border-color: var(--rw-accent);
          color: var(--rw-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .rw-btn {
          font-family: var(--rw-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 14px 32px;
          border: none;
          border-radius: 0;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.4s var(--rw-ease-out);
          display: inline-block;
        }

        .rw-btn-primary {
          background: var(--rw-navy);
          color: #fff;
        }

        .rw-btn-primary:hover {
          background: var(--rw-accent);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px ${palette.accent}33;
        }

        .rw-btn-outline {
          background: transparent;
          color: var(--rw-navy);
          border: 1.5px solid var(--rw-navy);
        }

        .rw-btn-outline:hover {
          background: var(--rw-navy);
          color: #fff;
          transform: translateY(-2px);
        }

        .rw-scroll-hint {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          animation: rw-fadeUp 0.8s var(--rw-ease-out) 1.8s forwards;
        }

        .rw-scroll-hint span {
          display: block;
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, var(--rw-accent), transparent);
          margin: 0 auto;
          animation: rw-pulse 2s ease-in-out infinite;
        }

        @keyframes rw-pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.3);
          }
        }

        @keyframes rw-fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        /* ═══════════ SCROLL REVEAL ═══════════ */
        .rw-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity 0.7s var(--rw-ease-out),
            transform 0.7s var(--rw-ease-out);
        }

        .rw-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .rw-delay-1 {
          transition-delay: 0.1s;
        }
        .rw-delay-2 {
          transition-delay: 0.2s;
        }
        .rw-delay-3 {
          transition-delay: 0.3s;
        }
        .rw-delay-4 {
          transition-delay: 0.4s;
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
          .rw-hero::before,
          .rw-hero::after,
          .rw-scroll-hint,
          .rw-orb-3 {
            display: none;
          }
          .rw-hero-actions {
            display: none;
          }
          .rw-share-row {
            display: none;
          }
          .rw-reveal {
            opacity: 1 !important;
            transform: none !important;
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
								color: "#6b6560",
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
					<div className="rw-orb-3" />
					<div className="rw-hero-content">
						{data.photo && (
							<div
								style={{
									width: 120,
									height: 120,
									borderRadius: "50%",
									overflow: "hidden",
									border: `3px solid ${palette.accent}`,
									marginBottom: 20,
									boxShadow: `0 4px 20px ${palette.accent}33`,
									display: "inline-block",
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
							<button
								onClick={() => shareLinkedIn()}
								className="rw-share-btn"
								title="Share on LinkedIn"
								type="button"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="1" y="1" width="14" height="14" rx="2" />
									<path d="M5 6.5v4M5 4.5v.01M8 10.5v-2.5a1.5 1.5 0 0 1 3 0v2.5M11 10.5v-2.5" />
								</svg>
							</button>
							<button
								onClick={() => shareWhatsApp()}
								className="rw-share-btn"
								title="Share on WhatsApp"
								type="button"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M2.5 13.5l1-3.5a5.5 5.5 0 1 1 2.1 2.1l-3.1.9z" />
									<path d="M6 7.5c.3.6.8 1.1 1.4 1.4l.6-.6a.5.5 0 0 1 .5-.1l1.2.4a.5.5 0 0 1 .3.5v.4a1 1 0 0 1-1 1c-2.2 0-4.5-2.3-4.5-4.5a1 1 0 0 1 1-1h.4a.5.5 0 0 1 .5.3l.4 1.2a.5.5 0 0 1-.1.5l-.7.5z" />
								</svg>
							</button>
							<button
								onClick={() => shareTwitter()}
								className="rw-share-btn"
								title="Share on X"
								type="button"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M3 3l4.5 5.5M3 13l4.5-5.5m0 0L10 3h3l-4.5 5.5m0 0L13 13h-3" />
								</svg>
							</button>
							<button
								onClick={() => shareEmail()}
								className="rw-share-btn"
								title="Share via Email"
								type="button"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="1.5" y="3" width="13" height="10" rx="1.5" />
									<path d="M1.5 5l6.5 4 6.5-4" />
								</svg>
							</button>
							<button
								onClick={() => copyLink()}
								className="rw-share-btn"
								title="Copy link"
								type="button"
							>
								{linkCopied ? (
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M3 8.5l3 3 7-7" />
									</svg>
								) : (
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M6.5 9.5l3-3M5 10.5l-1.3 1.3a1.5 1.5 0 0 0 2.1 2.1L7 12.5M9 5.5l1.3-1.3a1.5 1.5 0 0 1 2.1 2.1L11 7.5" />
									</svg>
								)}
							</button>
						</div>
					</div>
					<div className="rw-scroll-hint">
						<span />
					</div>
				</header>

				{/* ═══════════ CORE COMPETENCIES ═══════════ */}
				{data.skills.length > 0 && (
					<section className="rw-competencies" id="rw-competencies">
						<div className="rw-container">
							<div className="rw-section-header rw-reveal" ref={addRevealRef}>
								<span className="rw-section-number">01</span>
								<h2 className="rw-section-title">Core Competencies</h2>
								<div className="rw-section-line" />
							</div>
							<div className="rw-skills-grid">
								{data.skills.map((skill, i) => {
									const delayClass = `rw-delay-${Math.min(Math.floor(i / 3) + 1, 4)}`;
									return (
										<div
											key={i}
											className={`rw-skill-chip rw-reveal ${delayClass}`}
											ref={addRevealRef}
										>
											{skill}
										</div>
									);
								})}
							</div>
						</div>
					</section>
				)}

				{/* ═══════════ PROFESSIONAL EXPERIENCE ═══════════ */}
				{data.experience.length > 0 && (
					<section className="rw-section" id="rw-experience">
						<div className="rw-container">
							<div className="rw-section-header rw-reveal" ref={addRevealRef}>
								<span className="rw-section-number">
									{data.skills.length > 0 ? "02" : "01"}
								</span>
								<h2 className="rw-section-title">Professional Experience</h2>
								<div className="rw-section-line" />
							</div>

							{data.experience.map((exp) => (
								<div
									key={exp.id}
									className="rw-experience-item rw-reveal"
									ref={addRevealRef}
								>
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
									<div className="rw-reveal" ref={addRevealRef}>
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
									<div className="rw-reveal rw-delay-1" ref={addRevealRef}>
										<div className="rw-bottom-col-title">Volunteering</div>
										{data.volunteer.map((vol, i) => (
											<div key={i} className="rw-vol-item">
												{vol}
											</div>
										))}
									</div>
								)}

								{data.languages.length > 0 && (
									<div className="rw-reveal rw-delay-2" ref={addRevealRef}>
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
