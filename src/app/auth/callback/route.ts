import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { safeNextPath } from "@/lib/safe-path";
import { createClient } from "@/lib/supabase/server";

function resolveOrigin(request: Request, fallbackOrigin: string): string {
	const forwardedHost = request.headers.get("x-forwarded-host");
	if (process.env.NODE_ENV === "development" || !forwardedHost) {
		return fallbackOrigin;
	}
	const proto = request.headers.get("x-forwarded-proto") ?? "https";
	return `${proto}://${forwardedHost}`;
}

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = safeNextPath(searchParams.get("next"));
	const baseUrl = resolveOrigin(request, origin);

	// Supabase reports provider-side failures (denied consent, expired link) here.
	const providerError =
		searchParams.get("error_description") ?? searchParams.get("error");

	if (providerError) {
		console.error("Auth callback provider error:", providerError);
		return NextResponse.redirect(
			`${baseUrl}/login?error=auth&next=${encodeURIComponent(next)}`,
		);
	}

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				await ensureProfile(supabase, user.id);
			}

			return NextResponse.redirect(`${baseUrl}${next}`);
		}

		console.error("Auth callback exchange failed:", error.message);
	}

	return NextResponse.redirect(
		`${baseUrl}/login?error=auth&next=${encodeURIComponent(next)}`,
	);
}
