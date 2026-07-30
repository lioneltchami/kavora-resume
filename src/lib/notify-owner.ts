import {
	buildContactEmailPayload,
	resolveContactFromEmail,
} from "@/lib/contact-email";
import { createServiceClient } from "@/lib/supabase/service";

export interface ContactNotification {
	ownerUserId: string;
	slug: string;
	senderName: string;
	senderEmail: string;
	message: string;
}

export {
	buildContactEmailPayload,
	type ContactEmailPayload,
	portfolioMessagesInboxUrl,
	resolveContactFromEmail,
	sanitizeEmailField,
} from "@/lib/contact-email";

const RESEND_TIMEOUT_MS = 8_000;

/**
 * Best-effort email alert when a portfolio gets a contact message.
 *
 * Skipped when RESEND_API_KEY / SUPABASE_SERVICE_ROLE_KEY are absent —
 * the message is already stored and readable in the portfolio editor inbox, so
 * notification failures must never fail the visitor's request.
 */
export async function notifyOwnerOfContactMessage({
	ownerUserId,
	slug,
	senderName,
	senderEmail,
	message,
}: ContactNotification): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn("Contact notification skipped: RESEND_API_KEY missing");
		return;
	}
	if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
		console.warn(
			"Contact notification skipped: SUPABASE_SERVICE_ROLE_KEY missing",
		);
		return;
	}

	try {
		const supabase = createServiceClient();
		const { data, error } = await supabase.auth.admin.getUserById(ownerUserId);
		const ownerEmail = data?.user?.email;

		if (error || !ownerEmail) {
			console.warn("Contact notification skipped: owner email unavailable", {
				ownerUserId,
				error: error?.message,
			});
			return;
		}

		const payload = buildContactEmailPayload({
			from: resolveContactFromEmail(),
			ownerEmail,
			slug,
			senderName,
			senderEmail,
			message,
		});

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

		try {
			const response = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			if (!response.ok) {
				const body = await response.text().catch(() => "");
				console.error(
					`Contact notification Resend error ${response.status}: ${body}`,
				);
			}
		} finally {
			clearTimeout(timer);
		}
	} catch (err) {
		console.error("Contact notification failed:", err);
	}
}
