import { type NextRequest, NextResponse } from "next/server";
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
