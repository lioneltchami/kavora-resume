import { createHmac, timingSafeEqual } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    }),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

interface StripeSessionMetadata {
  user_id?: string;
  slug?: string;
  user_email?: string;
}

interface StripeEvent {
  type: string;
  data: {
    object: {
      metadata?: StripeSessionMetadata;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const sigHeader = req.headers.get("stripe-signature");
      if (
        !sigHeader ||
        !verifyStripeSignature(rawBody, sigHeader, webhookSecret)
      ) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    } else {
      console.warn(
        "STRIPE_WEBHOOK_SECRET not set — skipping signature verification",
      );
    }

    const body = JSON.parse(rawBody) as StripeEvent;

    if (body.type === "checkout.session.completed") {
      const session = body.data.object;
      const userId = session.metadata?.user_id;
      const slug = session.metadata?.slug;

      if (!userId) {
        console.warn(
          "Webhook: checkout.session.completed missing user_id in metadata",
        );
        return NextResponse.json({ received: true });
      }

      const supabase = createServiceClient();
      const now = new Date().toISOString();

      await supabase
        .from("profiles")
        .upsert(
          { user_id: userId, is_pro: true, paid_at: now },
          { onConflict: "user_id" },
        );

      if (slug) {
        const { data: resume } = await supabase
          .from("resumes")
          .select("data")
          .eq("slug", slug)
          .single();

        if (resume) {
          await supabase
            .from("resumes")
            .update({
              data: {
                ...(resume.data as Record<string, unknown>),
                isPro: true,
                paidAt: now,
              },
            })
            .eq("slug", slug);
        }
      }

      const { data: userResumes } = await supabase
        .from("resumes")
        .select("slug, data")
        .eq("user_id", userId);

      if (userResumes) {
        for (const resume of userResumes) {
          const existingData = resume.data as Record<string, unknown>;
          if (existingData.isPro === true) continue;
          await supabase
            .from("resumes")
            .update({
              data: { ...existingData, isPro: true, paidAt: now },
            })
            .eq("slug", resume.slug);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
