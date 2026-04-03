import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";
import type { PortfolioSettings } from "@/lib/portfolio-types";
import type { ResumeData } from "@/lib/types";

export const runtime = "edge";

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

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Fetch portfolio settings to verify it exists
    const { data: settings, error: settingsError } = await supabase
      .from("portfolio_settings")
      .select("bio")
      .eq("slug", slug)
      .single();

    if (settingsError || !settings) {
      return new Response("Not found", { status: 404 });
    }

    // Fetch resume data for name and title
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
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1e2a3a 0%, #2a3a4e 50%, #1e2a3a 100%)",
        fontFamily: "sans-serif",
      }}
    >
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

      {/* Title / headline */}
      {title && (
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "#b08d57",
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
          color: "#b08d57",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
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
