import { type NextRequest, NextResponse } from "next/server";
import { checkUserPro } from "@/lib/check-pro";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export const PRO_PRICE_CENTS = 1900;

export async function POST(req: NextRequest) {
	try {
		const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		// Auth first — a missing Stripe key must never hide "sign in required".
		if (!user) {
			return NextResponse.json(
				{
					error: "Sign in to upgrade so we can attach Pro to your account.",
					code: "AUTH_REQUIRED",
				},
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

		const { isPro } = await checkUserPro();
		if (isPro) {
			return NextResponse.json({ alreadyPro: true });
		}

		const origin = await getSiteOrigin();
		const successParams = new URLSearchParams({ slug: slug || "" });
		successParams.set("session_id", "{CHECKOUT_SESSION_ID}");

		const params = new URLSearchParams({
			mode: "payment",
			"line_items[0][price_data][currency]": "usd",
			"line_items[0][price_data][product_data][name]": "Kavora Pro",
			"line_items[0][price_data][product_data][description]":
				"One-time payment. Portfolio generator + all premium resume features.",
			"line_items[0][price_data][unit_amount]": String(PRO_PRICE_CENTS),
			"line_items[0][quantity]": "1",
			success_url: `${origin}/payment-success?${successParams.toString()}`,
			cancel_url: `${origin}/pricing?checkout=cancelled`,
			client_reference_id: user.id,
			"metadata[user_id]": user.id,
			"metadata[slug]": slug || "",
		});

		if (user.email) {
			params.set("customer_email", user.email);
			params.set("metadata[user_email]", user.email);
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
			console.error("Stripe checkout error:", session.error.message);
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
