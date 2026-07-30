import { type NextRequest, NextResponse } from "next/server";
import { resolveSlugOwnership, toResumeListItem } from "@/lib/resume-record";
import { createClient } from "@/lib/supabase/server";
import type { ResumeData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	const supabase = await createClient();

	// Get authenticated user
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { slug, data } = body as { slug: string; data: ResumeData };

		if (!slug || !data) {
			return NextResponse.json(
				{ error: "Missing slug or data" },
				{ status: 400 },
			);
		}

		// The upsert conflicts on `slug` alone, so without this check a signed-in
		// user could overwrite anyone else's resume by reusing their slug.
		const { data: existing, error: lookupError } = await supabase
			.from("resumes")
			.select("user_id")
			.eq("slug", slug)
			.maybeSingle();

		if (lookupError) {
			console.error("Supabase slug lookup error:", lookupError.message);
			return NextResponse.json(
				{ error: "Failed to save resume" },
				{ status: 500 },
			);
		}

		if (!resolveSlugOwnership(existing, user.id).allowed) {
			return NextResponse.json(
				{ error: "Slug already taken" },
				{ status: 409 },
			);
		}

		// Add user_id and default isPublic to the data
		const resumeData = {
			...data,
			userId: user.id,
			isPublic: data.isPublic ?? true,
		};

		const { error } = await supabase.from("resumes").upsert(
			{
				slug,
				data: resumeData,
				user_id: user.id,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "slug" },
		);

		if (error) {
			console.error("Supabase upsert error:", error);
			return NextResponse.json(
				{ error: "Failed to save resume" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, slug });
	} catch (err) {
		console.error("POST /api/resume error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest) {
	const supabase = await createClient();

	try {
		const { searchParams } = new URL(req.url);
		const slug = searchParams.get("slug");

		// `?mine=1` lists the signed-in user's saved resumes so the dashboard works
		// on any device instead of only where localStorage happens to live.
		if (searchParams.get("mine")) {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			}

			const { data, error } = await supabase
				.from("resumes")
				.select("slug, data, updated_at")
				.eq("user_id", user.id)
				.order("updated_at", { ascending: false });

			if (error) {
				console.error("GET /api/resume?mine error:", error.message);
				return NextResponse.json(
					{ error: "Failed to load resumes" },
					{ status: 500 },
				);
			}

			const resumes = (data ?? []).map((row) =>
				toResumeListItem({
					slug: row.slug as string,
					data: row.data,
					updated_at: row.updated_at as string | null,
				}),
			);

			return NextResponse.json({ resumes });
		}

		if (!slug) {
			return NextResponse.json(
				{ error: "Missing slug parameter" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("resumes")
			.select("slug, data")
			.eq("slug", slug)
			.single();

		if (error || !data) {
			return NextResponse.json({ error: "Resume not found" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (err) {
		console.error("GET /api/resume error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { slug } = (await req.json()) as { slug?: string };
		if (!slug) {
			return NextResponse.json({ error: "Missing slug" }, { status: 400 });
		}

		const { data, error } = await supabase
			.from("resumes")
			.delete()
			.eq("slug", slug)
			.eq("user_id", user.id)
			.select("slug")
			.maybeSingle();

		if (error) {
			console.error("DELETE /api/resume error:", error.message);
			return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Not found or unauthorized" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("DELETE /api/resume error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { oldSlug, newSlug } = await req.json();

		if (!oldSlug || !newSlug) {
			return NextResponse.json({ error: "Missing slugs" }, { status: 400 });
		}

		// Validate slug format: lowercase alphanumeric + hyphens, 2-80 chars
		const slugRegex = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/;
		if (!slugRegex.test(newSlug)) {
			return NextResponse.json(
				{
					error:
						"Invalid URL format. Use lowercase letters, numbers, and hyphens only.",
				},
				{ status: 400 },
			);
		}

		// Verify ownership
		const { data: existing } = await supabase
			.from("resumes")
			.select("data, user_id")
			.eq("slug", oldSlug)
			.single();

		if (!existing || existing.user_id !== user.id) {
			return NextResponse.json(
				{ error: "Not found or unauthorized" },
				{ status: 404 },
			);
		}

		// Check new slug availability
		const { data: conflict } = await supabase
			.from("resumes")
			.select("slug")
			.eq("slug", newSlug)
			.single();

		if (conflict) {
			return NextResponse.json(
				{ error: "Slug already taken" },
				{ status: 409 },
			);
		}

		// Update slug
		const updatedData = {
			...(existing.data as Record<string, unknown>),
			slug: newSlug,
		};
		const { error } = await supabase
			.from("resumes")
			.update({
				slug: newSlug,
				data: updatedData,
				updated_at: new Date().toISOString(),
			})
			.eq("slug", oldSlug);

		if (error) {
			console.error("Supabase slug update error:", error);
			return NextResponse.json({ error: "Failed to update" }, { status: 500 });
		}

		return NextResponse.json({ success: true, slug: newSlug });
	} catch (err) {
		console.error("PATCH /api/resume error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
