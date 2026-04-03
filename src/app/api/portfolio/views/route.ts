import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { slug } = (await req.json()) as { slug: string };

    if (!slug)
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const userAgent = req.headers.get("user-agent") ?? null;
    const referrer = req.headers.get("referer") ?? null;

    await supabase
      .from("portfolio_views")
      .insert({ slug, user_agent: userAgent, referrer });

    // Return total view count
    const { count } = await supabase
      .from("portfolio_views")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug);

    return NextResponse.json({ views: count ?? 0 });
  } catch (err) {
    console.error("portfolio/views POST error:", err);
    return NextResponse.json({ views: 0 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) return NextResponse.json({ views: 0, last7: 0, last30: 0 });

    const now = new Date();
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [totalResult, last30Result, last7Result] = await Promise.all([
      supabase
        .from("portfolio_views")
        .select("*", { count: "exact", head: true })
        .eq("slug", slug),
      supabase
        .from("portfolio_views")
        .select("*", { count: "exact", head: true })
        .eq("slug", slug)
        .gte("viewed_at", thirtyDaysAgo),
      supabase
        .from("portfolio_views")
        .select("*", { count: "exact", head: true })
        .eq("slug", slug)
        .gte("viewed_at", sevenDaysAgo),
    ]);

    return NextResponse.json({
      views: totalResult.count ?? 0,
      last30: last30Result.count ?? 0,
      last7: last7Result.count ?? 0,
    });
  } catch (err) {
    console.error("portfolio/views GET error:", err);
    return NextResponse.json({ views: 0, last30: 0, last7: 0 });
  }
}
