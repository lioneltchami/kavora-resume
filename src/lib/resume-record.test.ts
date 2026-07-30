import { describe, expect, it } from "vitest";
import { resolveSlugOwnership, toResumeListItem } from "./resume-record";

describe("resolveSlugOwnership", () => {
	it("allows an unclaimed slug to be inserted", () => {
		expect(resolveSlugOwnership(undefined, "user-1")).toEqual({
			allowed: true,
			reason: "new-slug",
		});
		expect(resolveSlugOwnership(null, "user-1")).toEqual({
			allowed: true,
			reason: "new-slug",
		});
	});

	it("allows the owner to update their own slug", () => {
		expect(resolveSlugOwnership({ user_id: "user-1" }, "user-1")).toEqual({
			allowed: true,
			reason: "same-owner",
		});
	});

	it("denies writing to a slug owned by someone else", () => {
		expect(resolveSlugOwnership({ user_id: "user-2" }, "user-1")).toEqual({
			allowed: false,
			reason: "foreign-owner",
		});
	});

	it("denies claiming a legacy row with no owner", () => {
		expect(resolveSlugOwnership({ user_id: null }, "user-1")).toEqual({
			allowed: false,
			reason: "foreign-owner",
		});
	});
});

describe("toResumeListItem", () => {
	it("maps tailored version metadata alongside the base fields", () => {
		expect(
			toResumeListItem({
				slug: "jane-stripe",
				data: {
					name: "Jane Doe",
					paletteId: "midnight",
					label: "Stripe — Senior PM",
					parentSlug: "jane",
				},
				updated_at: "2026-07-01T12:00:00.000Z",
			}),
		).toEqual({
			slug: "jane-stripe",
			name: "Jane Doe",
			paletteId: "midnight",
			label: "Stripe — Senior PM",
			parentSlug: "jane",
			savedAt: "2026-07-01T12:00:00.000Z",
		});
	});

	it("leaves version metadata undefined for untailored resumes", () => {
		const item = toResumeListItem({
			slug: "jane",
			data: { name: "Jane Doe" },
			updated_at: "2026-07-01T12:00:00.000Z",
		});

		expect(item.label).toBeUndefined();
		expect(item.parentSlug).toBeUndefined();
		expect(item.paletteId).toBeUndefined();
		expect(item.name).toBe("Jane Doe");
	});

	it("tolerates legacy rows with missing or malformed data", () => {
		const fallback = "2026-01-01T00:00:00.000Z";

		expect(
			toResumeListItem({ slug: "old", data: null, updated_at: null }, fallback),
		).toEqual({
			slug: "old",
			name: "",
			paletteId: undefined,
			label: undefined,
			parentSlug: undefined,
			savedAt: fallback,
		});

		expect(
			toResumeListItem(
				{ slug: "old", data: { name: 42, label: {} }, updated_at: null },
				fallback,
			),
		).toEqual({
			slug: "old",
			name: "",
			paletteId: undefined,
			label: undefined,
			parentSlug: undefined,
			savedAt: fallback,
		});
	});
});
