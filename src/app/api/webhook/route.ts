import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // In production, verify webhook signature with STRIPE_WEBHOOK_SECRET
  // For now, basic implementation

  try {
    const body = await req.json();

    if (body.type === "checkout.session.completed") {
      const session = body.data.object;
      const slug = session.metadata?.slug;

      if (slug) {
        const supabase = await createClient();

        // Mark the resume as pro/paid
        const { data: resume } = await supabase
          .from("resumes")
          .select("data")
          .eq("slug", slug)
          .single();

        if (resume) {
          const updatedData = {
            ...(resume.data as Record<string, unknown>),
            isPro: true,
            paidAt: new Date().toISOString(),
          };
          await supabase
            .from("resumes")
            .update({ data: updatedData })
            .eq("slug", slug);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
