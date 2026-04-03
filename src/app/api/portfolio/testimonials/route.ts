import { type NextRequest, NextResponse } from "next/server";
import { checkUserPro } from "@/lib/check-pro";
import type { PortfolioTestimonial } from "@/lib/portfolio-types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const slug = new URL(req.url).searchParams.get("slug");

    if (slug) {
      const { data, error } = await supabase
        .from("portfolio_testimonials")
        .select("*")
        .eq(
          "user_id",
          (
            await supabase
              .from("portfolio_settings")
              .select("user_id")
              .eq("slug", slug)
              .single()
          ).data?.user_id ?? "",
        )
        .order("display_order", { ascending: true });

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ testimonials: data ?? [] });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("portfolio_testimonials")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ testimonials: data ?? [] });
  } catch (err) {
    console.error("portfolio/testimonials GET error:", err);
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

    const { isPro } = await checkUserPro();
    if (!isPro) {
      return NextResponse.json(
        { error: "Testimonials require a Pro account." },
        { status: 403 },
      );
    }

    const body = (await req.json()) as Omit<
      PortfolioTestimonial,
      "id" | "user_id" | "created_at"
    >;

    const { data, error } = await supabase
      .from("portfolio_testimonials")
      .insert({ ...body, user_id: user.id })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ testimonial: data }, { status: 201 });
  } catch (err) {
    console.error("portfolio/testimonials POST error:", err);
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

    const body = (await req.json()) as Partial<PortfolioTestimonial> & {
      id: string;
    };
    if (!body.id)
      return NextResponse.json(
        { error: "Missing testimonial id" },
        { status: 400 },
      );

    const { id, user_id: _uid, created_at: _ca, ...updates } = body;

    const { data, error } = await supabase
      .from("portfolio_testimonials")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data)
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );

    return NextResponse.json({ testimonial: data });
  } catch (err) {
    console.error("portfolio/testimonials PUT error:", err);
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
        { error: "Missing testimonial id" },
        { status: 400 },
      );

    const { error } = await supabase
      .from("portfolio_testimonials")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("portfolio/testimonials DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
