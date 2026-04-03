import { type NextRequest, NextResponse } from "next/server";
import { checkUserPro } from "@/lib/check-pro";
import type { PortfolioProject } from "@/lib/portfolio-types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FREE_PROJECT_LIMIT = 3;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const slug = new URL(req.url).searchParams.get("slug");

    if (slug) {
      // Public access: fetch projects for a portfolio slug
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("slug", slug)
        .order("display_order", { ascending: true });

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ projects: data ?? [] });
    }

    // Authenticated: fetch user's own projects
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ projects: data ?? [] });
  } catch (err) {
    console.error("portfolio/projects GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check Pro status and project count limit
    const { isPro } = await checkUserPro();
    if (!isPro) {
      const { count } = await supabase
        .from("portfolio_projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((count ?? 0) >= FREE_PROJECT_LIMIT) {
        return NextResponse.json(
          {
            error: `Free plan is limited to ${FREE_PROJECT_LIMIT} projects. Upgrade to Pro for unlimited projects.`,
          },
          { status: 403 },
        );
      }
    }

    const body = (await req.json()) as Omit<
      PortfolioProject,
      "id" | "user_id" | "created_at"
    >;

    const { data, error } = await supabase
      .from("portfolio_projects")
      .insert({ ...body, user_id: user.id })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (err) {
    console.error("portfolio/projects POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as Partial<PortfolioProject> & {
      id: string;
    };
    if (!body.id)
      return NextResponse.json(
        { error: "Missing project id" },
        { status: 400 },
      );

    const { id, user_id: _uid, created_at: _ca, ...updates } = body;

    const { data, error } = await supabase
      .from("portfolio_projects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data)
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 },
      );

    return NextResponse.json({ project: data });
  } catch (err) {
    console.error("portfolio/projects PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = (await req.json()) as { id: string };
    if (!id)
      return NextResponse.json(
        { error: "Missing project id" },
        { status: 400 },
      );

    // Get image URL before deleting (to clean up storage)
    const { data: project } = await supabase
      .from("portfolio_projects")
      .select("image_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (project?.image_url) {
      // Extract storage path from URL and delete from bucket
      const url = new URL(project.image_url);
      const pathParts = url.pathname.split("/portfolio-assets/");
      if (pathParts.length === 2) {
        await supabase.storage.from("portfolio-assets").remove([pathParts[1]]);
      }
    }

    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("portfolio/projects DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
