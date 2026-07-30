import { createServiceClient } from "@/lib/supabase/service";

interface ContactNotification {
	ownerUserId: string;
	slug: string;
	senderName: string;
	senderEmail: string;
	message: string;
}

/**
 * Best-effort email alert when a portfolio gets a contact message.
 *
 * Skipped silently when RESEND_API_KEY / SUPABASE_SERVICE_ROLE_KEY are absent —
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
	if (!apiKey || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

	try {
		const supabase = createServiceClient();
		const { data, error } = await supabase.auth.admin.getUserById(ownerUserId);
		const ownerEmail = data?.user?.email;

		if (error || !ownerEmail) return;

		const from =
			process.env.CONTACT_FROM_EMAIL ?? "Kavora <onboarding@resend.dev>";

		await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: [ownerEmail],
				reply_to: senderEmail,
				subject: `New message from ${senderName} on your Kavora portfolio`,
				text: [
					`${senderName} (${senderEmail}) sent you a message via /p/${slug}:`,
					"",
					message,
					"",
					"Reply directly to this email to respond.",
				].join("\n"),
			}),
		});
	} catch (err) {
		console.error("Contact notification failed:", err);
	}
}
