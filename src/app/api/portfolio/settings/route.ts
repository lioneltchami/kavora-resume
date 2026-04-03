import { type NextRequest, NextResponse } from "next/server";
import type { PortfolioSettings } from "@/lib/portfolio-types";
import { emptyPortfolioSettings } from "@/lib/portfolio-types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from("portfolio_settings")
			.select("*")
			.eq("user_id", user.id)
			.single();

		if (error && error.code !== "PGRST116") {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({
			settings: data ?? { ...emptyPortfolioSettings, user_id: user.id },
		});
	} catch (err) {
		console.error("portfolio/settings GET error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = (await req.json()) as Partial<PortfolioSettings>;

		// Validate slug uniqueness (only if slug is changing)
		if (body.slug) {
			const { data: existing } = await supabase
				.from("portfolio_settings")
				.select("user_id")
				.eq("slug", body.slug)
				.neq("user_id", user.id)
				.single();

			if (existing) {
				return NextResponse.json(
					{ error: "This slug is already taken" },
					{ status: 409 },
				);
			}
		}

		const settingsToSave: Partial<PortfolioSettings> & { user_id: string } = {
			...body,
			user_id: user.id,
		};

		const { data, error } = await supabase
			.from("portfolio_settings")
			.upsert(settingsToSave, { onConflict: "user_id" })
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ settings: data });
	} catch (err) {
		console.error("portfolio/settings POST error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
