import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET) {
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 503 },
    );
  }

  try {
    const { slug } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const params = new URLSearchParams({
      mode: "payment",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": "Kavora Pro",
      "line_items[0][price_data][product_data][description]":
        "One-time payment. Portfolio generator + all premium resume features.",
      "line_items[0][price_data][unit_amount]": "1900",
      "line_items[0][quantity]": "1",
      success_url: `${req.nextUrl.origin}/payment-success?slug=${slug || ""}`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
      "metadata[slug]": slug || "",
    });

    if (user) {
      params.set("metadata[user_id]", user.id);
      if (user.email) {
        params.set("metadata[user_email]", user.email);
      }
    }

    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      },
    );

    const session = await response.json();

    if (session.error) {
      return NextResponse.json(
        { error: session.error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
