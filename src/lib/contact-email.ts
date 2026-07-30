const DEFAULT_FROM = "Kavora <onboarding@resend.dev>";
const DEFAULT_SITE_URL = "https://kavoraresume.cv";

export interface ContactEmailPayload {
	from: string;
	to: string[];
	reply_to: string;
	subject: string;
	text: string;
}

/** Collapse whitespace / control chars so subject lines stay one-line and safe. */
export function sanitizeEmailField(value: string, max = 120): string {
	return value
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, max);
}

export function portfolioMessagesInboxUrl(
	siteUrl: string = (
		process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
	).replace(/\/$/, ""),
): string {
	return `${siteUrl}/create/portfolio?tab=messages`;
}

export function buildContactEmailPayload(input: {
	from: string;
	ownerEmail: string;
	slug: string;
	senderName: string;
	senderEmail: string;
	message: string;
	inboxUrl?: string;
}): ContactEmailPayload {
	const senderName = sanitizeEmailField(input.senderName, 100) || "Someone";
	const senderEmail = sanitizeEmailField(input.senderEmail, 254);
	const slug = sanitizeEmailField(input.slug, 80);
	const inboxUrl = input.inboxUrl ?? portfolioMessagesInboxUrl();

	return {
		from: input.from,
		to: [input.ownerEmail],
		reply_to: senderEmail,
		subject: `New message from ${senderName} on your Kavora portfolio`,
		text: [
			`${senderName} (${senderEmail}) sent you a message via /p/${slug}:`,
			"",
			input.message.trim(),
			"",
			"Reply directly to this email to respond.",
			"",
			`Open inbox: ${inboxUrl}`,
		].join("\n"),
	};
}

export function resolveContactFromEmail(
	envFrom: string | undefined = process.env.CONTACT_FROM_EMAIL,
): string {
	const trimmed = envFrom?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_FROM;
}
