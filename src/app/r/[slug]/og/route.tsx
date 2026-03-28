import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";
import type { ResumeData } from "@/lib/types";
import { getPalette } from "@/lib/types";

export const runtime = "edge";

/* ------------------------------------------------------------------ */
/*  Hardcoded fallback for the "reena" demo slug                      */
/* ------------------------------------------------------------------ */

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

      // Respect privacy — don't generate OG images for private resumes
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

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${palette.headerBg} 0%, ${palette.primary} 50%, ${palette.headerBg} 100%)`,
        fontFamily: "sans-serif",
      }}
    >
      {/* Photo */}
      {photo && (
        <img
          src={photo}
          width={120}
          height={120}
          style={{
            borderRadius: "50%",
            border: `4px solid ${palette.accent}`,
            objectFit: "cover",
            marginBottom: 24,
          }}
        />
      )}

      {/* Name */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.1,
          padding: "0 60px",
          maxWidth: "100%",
        }}
      >
        {name}
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: palette.accent,
            textAlign: "center",
            marginTop: 16,
            padding: "0 60px",
            maxWidth: "100%",
          }}
        >
          {title}
        </div>
      )}

      {/* Branding */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          fontSize: 16,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.4)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Kavora Resume Builder
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
