import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";
import type { ResumeData } from "@/lib/types";

export const runtime = "edge";

/* Hallmark OG tokens — approximate design.md paper/ink/accent for Satori */
const OG = {
	paper: "#f3f5f7",
	paper2: "#e8ecf0",
	ink: "#2a323c",
	ink2: "#5a6570",
	accent: "#a8894a",
	rule: "#d5dae0",
} as const;

/* ------------------------------------------------------------------ */
/*  GET /p/[slug]/og — generates a 1200x630 OG image for portfolio    */
/* ------------------------------------------------------------------ */

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	let name = "";
	let title = "";

	if (slug === "reena") {
		name = "Reena Sumputh";
		title = "Client Service Representative";
	} else {
		try {
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			);

			const { data: settings, error: settingsError } = await supabase
				.from("portfolio_settings")
				.select("bio")
				.eq("slug", slug)
				.single();

			if (settingsError || !settings) {
				return new Response("Not found", { status: 404 });
			}

			const { data: resumeRow, error: resumeError } = await supabase
				.from("resumes")
				.select("data")
				.eq("slug", slug)
				.single();

			if (resumeError || !resumeRow) {
				return new Response("Not found", { status: 404 });
			}

			const resumeData = resumeRow.data as ResumeData;
			name = resumeData.name;
			title = resumeData.title ?? resumeData.experience?.[0]?.title ?? "";
		} catch {
			return new Response("Not found", { status: 404 });
		}
	}

	if (!name) {
		return new Response("Not found", { status: 404 });
	}

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "flex-end",
				alignItems: "flex-start",
				background: OG.paper,
				fontFamily: "Georgia, 'Times New Roman', serif",
				padding: "64px 72px",
			}}
		>
			<div
				style={{
					display: "flex",
					width: "120px",
					height: "3px",
					background: OG.accent,
					marginBottom: 28,
				}}
			/>
			<div
				style={{
					fontSize: 64,
					fontWeight: 600,
					color: OG.ink,
					textAlign: "left",
					lineHeight: 1.1,
					maxWidth: "90%",
				}}
			>
				{name}
			</div>
			{title ? (
				<div
					style={{
						fontSize: 28,
						fontWeight: 400,
						color: OG.ink2,
						textAlign: "left",
						marginTop: 16,
						maxWidth: "90%",
						fontFamily: "sans-serif",
					}}
				>
					{title}
				</div>
			) : null}
			<div
				style={{
					display: "flex",
					marginTop: 40,
					fontSize: 16,
					fontWeight: 600,
					color: OG.accent,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					fontFamily: "sans-serif",
				}}
			>
				Portfolio — Kavora
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
