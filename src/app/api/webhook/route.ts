import { createHmac, timingSafeEqual } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { grantPro } from "@/lib/grant-pro";

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

interface StripeCheckoutSession {
	id?: string;
	client_reference_id?: string | null;
	payment_status?: string;
	metadata?: StripeSessionMetadata;
}

interface StripeEvent {
	type: string;
	data: { object: StripeCheckoutSession };
}

const PAID_EVENTS = new Set([
	"checkout.session.completed",
	"checkout.session.async_payment_succeeded",
]);

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

		if (!PAID_EVENTS.has(body.type)) {
			return NextResponse.json({ received: true });
		}

		const session = body.data.object;

		// `unpaid` sessions arrive for delayed payment methods; wait for the
		// async_payment_succeeded event instead of granting access early.
		if (session.payment_status && session.payment_status === "unpaid") {
			return NextResponse.json({ received: true });
		}

		const userId = session.metadata?.user_id ?? session.client_reference_id;
		const slug = session.metadata?.slug;

		if (!userId) {
			// Returning 4xx makes Stripe retry and surfaces the failure in the
			// dashboard rather than silently leaving a paying user on the free tier.
			console.error(
				`Webhook: paid session ${session.id ?? "unknown"} has no user_id or client_reference_id — Pro not granted`,
			);
			return NextResponse.json(
				{ error: "Payment could not be attributed to a user" },
				{ status: 400 },
			);
		}

		await grantPro(userId, slug);

		return NextResponse.json({ received: true });
	} catch (err) {
		console.error("Webhook processing failed:", err);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}
}
