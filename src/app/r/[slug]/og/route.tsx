import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";
import type { ResumeData } from "@/lib/types";
import { getPalette } from "@/lib/types";

export const runtime = "edge";

/* Hallmark OG tokens — approximate design.md paper/ink/accent for Satori */
const OG = {
	paper: "#f3f5f7",
	ink: "#2a323c",
	ink2: "#5a6570",
	accent: "#a8894a",
} as const;

const reenaOgData = {
	name: "Reena Sumputh",
	title: "Client Service Representative",
	paletteId: undefined as string | undefined,
	photo: undefined as string | undefined,
};

/* ------------------------------------------------------------------ */
/*  GET /r/[slug]/og — generates a 1200×630 OG image                  */
/* ------------------------------------------------------------------ */

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	let name = "";
	let title = "";
	let paletteId: string | undefined;
	let photo: string | undefined;

	if (slug === "reena") {
		name = reenaOgData.name;
		title = reenaOgData.title;
		paletteId = reenaOgData.paletteId;
		photo = reenaOgData.photo;
	} else {
		try {
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			);

			const { data, error } = await supabase
				.from("resumes")
				.select("data")
				.eq("slug", slug)
				.single();

			if (error || !data) {
				return new Response("Not found", { status: 404 });
			}

			const resumeData = data.data as ResumeData;

			if (resumeData.isPublic === false) {
				return new Response("Not found", { status: 404 });
			}

			name = resumeData.name;
			title = resumeData.experience?.[0]?.title ?? "";
			paletteId = resumeData.paletteId;
			photo = resumeData.photo;
		} catch {
			return new Response("Not found", { status: 404 });
		}
	}

	const palette = getPalette(paletteId);
	const accent = palette.accent || OG.accent;

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
			{photo ? (
				<img
					src={photo}
					width={96}
					height={96}
					style={{
						borderRadius: 2,
						border: `1px solid ${accent}`,
						objectFit: "cover",
						marginBottom: 24,
					}}
				/>
			) : null}

			<div
				style={{
					display: "flex",
					width: "120px",
					height: "3px",
					background: accent,
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
					color: accent,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					fontFamily: "sans-serif",
				}}
			>
				Resume — Kavora
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
