import { type NextRequest, NextResponse } from "next/server";
import { grantPro } from "@/lib/grant-pro";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface StripeSession {
  id: string;
  payment_status?: string;
  status?: string;
  client_reference_id?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: { user_id?: string; slug?: string; user_email?: string } | null;
  error?: { message: string };
}

/**
 * Grants Pro from a completed Checkout Session for the signed-in user.
 *
 * The Stripe webhook is the primary path; this runs when the buyer lands on
 * /payment-success so a missing or misconfigured webhook can never leave a
 * paid customer on the free tier.
 */
export async function POST(req: NextRequest) {
  try {
    const { session_id: sessionId } = (await req.json().catch(() => ({}))) as {
      session_id?: string;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Auth first — a missing Stripe key must never hide "sign in required".
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }

    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET) {
      return NextResponse.json(
        { error: "Payment not configured" },
        { status: 503 },
      );
    }

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${STRIPE_SECRET}` } },
    );
    const session = (await response.json()) as StripeSession;

    if (!response.ok || session.error) {
      console.error("claim-pro: session lookup failed", session.error?.message);
      return NextResponse.json(
        { error: "Could not verify payment" },
        { status: 400 },
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment is not complete yet", paid: false },
        { status: 409 },
      );
    }

    const sessionEmail = session.customer_details?.email?.toLowerCase() ?? null;
    const userEmail = user.email?.toLowerCase() ?? null;
    const ownsSession =
      session.client_reference_id === user.id ||
      session.metadata?.user_id === user.id ||
      (Boolean(sessionEmail) && sessionEmail === userEmail);

    if (!ownsSession) {
      console.warn(
        `claim-pro: user ${user.id} attempted to claim session ${session.id}`,
      );
      return NextResponse.json(
        { error: "This payment belongs to a different account" },
        { status: 403 },
      );
    }

    await grantPro(user.id, session.metadata?.slug);

    return NextResponse.json({ isPro: true });
  } catch (err) {
    console.error("claim-pro error:", err);
    return NextResponse.json(
      { error: "Failed to activate Pro" },
      { status: 500 },
    );
  }
}
