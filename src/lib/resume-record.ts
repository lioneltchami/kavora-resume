import type { ResumeData } from "./types";

export type SlugOwnership =
	| { allowed: true; reason: "new-slug" | "same-owner" }
	| { allowed: false; reason: "foreign-owner" };

export interface ResumeListItem {
	slug: string;
	name: string;
	paletteId?: string;
	label?: string;
	parentSlug?: string;
	savedAt: string;
}

export interface ResumeRow {
	slug: string;
	data: unknown;
	updated_at: string | null;
}

/**
 * Decides whether `userId` may write to a slug. Only an exact owner match can
 * overwrite an existing row: rows with a different or missing owner stay locked
 * so a signed-in user cannot claim someone else's (or a legacy anonymous) slug.
 */
export function resolveSlugOwnership(
	existing: { user_id: string | null } | null | undefined,
	userId: string,
): SlugOwnership {
	if (!existing) {
		return { allowed: true, reason: "new-slug" };
	}
	if (existing.user_id === userId) {
		return { allowed: true, reason: "same-owner" };
	}
	return { allowed: false, reason: "foreign-owner" };
}

function optionalString(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function toResumeListItem(
	row: ResumeRow,
	fallbackSavedAt: string = new Date().toISOString(),
): ResumeListItem {
	const data = (row.data ?? {}) as Partial<ResumeData>;

	return {
		slug: row.slug,
		name: optionalString(data.name) ?? "",
		paletteId: optionalString(data.paletteId),
		label: optionalString(data.label),
		parentSlug: optionalString(data.parentSlug),
		savedAt: optionalString(row.updated_at) ?? fallbackSavedAt,
	};
}
