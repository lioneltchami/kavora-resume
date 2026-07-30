export const DEFAULT_POST_AUTH_PATH = "/create";

/**
 * Validates a `next` redirect target coming from a query string or form field.
 * Anything that could leave the site (absolute URLs, protocol-relative paths,
 * backslash tricks) or bounce back into the auth screens is rejected.
 */
export function safeNextPath(
	raw: string | null | undefined,
	fallback: string = DEFAULT_POST_AUTH_PATH,
): string {
	if (!raw) return fallback;

	const value = raw.trim();
	if (!value.startsWith("/")) return fallback;
	if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
	if (value.includes("://") || /[\r\n]/.test(value)) return fallback;

	const pathOnly = value.split(/[?#]/)[0];
	if (pathOnly === "/login" || pathOnly.startsWith("/auth/")) return fallback;

	return value;
}
