import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type OwnedSlug =
  { ok: true; slug: string } | { ok: false; response: NextResponse };

/**
 * Resolves the signed-in user's portfolio slug. Every message query is scoped
 * to it, so ownership is enforced in the route as well as by RLS.
 */
async function resolveOwnedSlug(supabase: Supabase): Promise<OwnedSlug> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data } = await supabase
    .from("portfolio_settings")
    .select("slug")
    .eq("user_id", user.id)
    .single();

  if (!data?.slug) {
    // No portfolio published yet — an empty inbox, not an error.
    return {
      ok: false,
      response: NextResponse.json({ messages: [], unread: 0 }),
    };
  }

  return { ok: true, slug: data.slug };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const owned = await resolveOwnedSlug(supabase);
    if (!owned.ok) return owned.response;

    const { data, error } = await supabase
      .from("portfolio_contact_messages")
      .select("*")
      .eq("slug", owned.slug)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages = data ?? [];
    return NextResponse.json({
      messages,
      unread: messages.filter((m) => !m.is_read).length,
    });
  } catch (err) {
    console.error("portfolio/messages GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const owned = await resolveOwnedSlug(supabase);
    if (!owned.ok) return owned.response;

    const { id, is_read } = (await req.json()) as {
      id?: string;
      is_read?: boolean;
    };

    if (!id) {
      return NextResponse.json(
        { error: "Missing message id" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("portfolio_contact_messages")
      .update({ is_read: is_read ?? true })
      .eq("id", id)
      .eq("slug", owned.slug)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: data });
  } catch (err) {
    console.error("portfolio/messages PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const owned = await resolveOwnedSlug(supabase);
    if (!owned.ok) return owned.response;

    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json(
        { error: "Missing message id" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("portfolio_contact_messages")
      .delete()
      .eq("id", id)
      .eq("slug", owned.slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("portfolio/messages DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
