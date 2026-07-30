import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/safe-path";

export async function proxy(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({ request });
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Refresh the session token
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protected routes — redirect to login if not authenticated
	const protectedPaths = ["/create", "/my-resumes", "/update-password"];
	const isProtected = protectedPaths.some((p) =>
		request.nextUrl.pathname.startsWith(p),
	);

	if (isProtected && !user) {
		const target = request.nextUrl.pathname + request.nextUrl.search;
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		url.search = "";
		url.searchParams.set("next", target);
		return NextResponse.redirect(url);
	}

	// Redirect logged-in users away from login, honoring where they were headed
	if (request.nextUrl.pathname === "/login" && user) {
		const target = safeNextPath(request.nextUrl.searchParams.get("next"));
		return NextResponse.redirect(new URL(target, request.nextUrl.origin));
	}

	return supabaseResponse;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon\\.ico|kavora-logo|apple-touch|favicon-|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
