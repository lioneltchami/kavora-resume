import { createServiceClient } from "@/lib/supabase/service";

/**
 * Marks a user as Pro and back-fills `isPro` on their published resumes so
 * shared pages drop Kavora branding. Shared by the Stripe webhook and the
 * authenticated claim endpoint, so both paths grant identical access.
 */
export async function grantPro(
	userId: string,
	slug?: string | null,
): Promise<void> {
	const supabase = createServiceClient();
	const now = new Date().toISOString();

	const { error: profileError } = await supabase
		.from("profiles")
		.upsert(
			{ user_id: userId, is_pro: true, paid_at: now },
			{ onConflict: "user_id" },
		);

	if (profileError) {
		throw new Error(`Failed to mark profile as Pro: ${profileError.message}`);
	}

	// A resume published before sign-in may not carry user_id yet.
	if (slug) {
		const { data: resume } = await supabase
			.from("resumes")
			.select("data")
			.eq("slug", slug)
			.single();

		if (resume) {
			await supabase
				.from("resumes")
				.update({
					data: {
						...(resume.data as Record<string, unknown>),
						isPro: true,
						paidAt: now,
					},
				})
				.eq("slug", slug);
		}
	}

	const { data: userResumes } = await supabase
		.from("resumes")
		.select("slug, data")
		.eq("user_id", userId);

	for (const resume of userResumes ?? []) {
		const existingData = resume.data as Record<string, unknown>;
		if (existingData.isPro === true) continue;

		await supabase
			.from("resumes")
			.update({ data: { ...existingData, isPro: true, paidAt: now } })
			.eq("slug", resume.slug);
	}
}
