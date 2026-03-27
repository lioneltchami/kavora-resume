import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Fetch current resume
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("data")
      .eq("slug", slug)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ views: 0 });
    }

    const currentViews = (resume.data as any).views || 0;
    const newViews = currentViews + 1;

    // Update the views count in the data JSONB
    const updatedData = { ...(resume.data as any), views: newViews };
    await supabase
      .from("resumes")
      .update({ data: updatedData })
      .eq("slug", slug);

    return NextResponse.json({ views: newViews });
  } catch {
    return NextResponse.json({ views: 0 });
  }
}

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ views: 0 });
  }

  try {
    const supabase = await createClient();
    const { data: resume } = await supabase
      .from("resumes")
      .select("data")
      .eq("slug", slug)
      .single();

    const views = (resume?.data as any)?.views || 0;
    return NextResponse.json({ views });
  } catch {
    return NextResponse.json({ views: 0 });
  }
}
