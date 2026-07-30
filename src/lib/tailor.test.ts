import { describe, expect, it } from "vitest";
import {
	applyTailorPatch,
	buildFallbackTailorPatch,
	buildTailorLabel,
	canUseFreeTailor,
	FREE_TAILOR_LIMIT,
	parseTailorModelJson,
} from "./tailor";
import type { ResumeData } from "./types";

const baseResume: ResumeData = {
	slug: "jane-abc1",
	name: "Jane Doe",
	location: "Toronto",
	phone: "555",
	email: "jane@example.com",
	summary: "Customer service professional.",
	skills: ["Zendesk", "Excel"],
	experience: [
		{
			id: "exp1",
			title: "Support Lead",
			company: "Acme",
			location: "Remote",
			startDate: "2020",
			endDate: "Present",
			bullets: ["Helped customers", "Trained team"],
		},
	],
	education: [],
	volunteer: [],
	languages: [],
};

describe("buildTailorLabel", () => {
	it("uses company and role when both present", () => {
		expect(buildTailorLabel({ company: "Stripe", role: "Backend" })).toBe(
			"Stripe — Backend",
		);
	});

	it("falls back to company only", () => {
		expect(buildTailorLabel({ company: "Stripe", role: "" })).toBe("Stripe");
	});
});

describe("canUseFreeTailor", () => {
	it("allows free users under the limit", () => {
		expect(canUseFreeTailor({ isPro: false, used: 0 })).toEqual({
			allowed: true,
			remaining: FREE_TAILOR_LIMIT,
		});
	});

	it("blocks free users at the limit", () => {
		expect(canUseFreeTailor({ isPro: false, used: FREE_TAILOR_LIMIT })).toEqual(
			{
				allowed: false,
				remaining: 0,
			},
		);
	});

	it("always allows Pro", () => {
		expect(canUseFreeTailor({ isPro: true, used: 99 })).toEqual({
			allowed: true,
			remaining: null,
		});
	});
});

describe("applyTailorPatch", () => {
	it("rewrites summary/bullets/skills while preserving experience identity", () => {
		const patched = applyTailorPatch(baseResume, {
			summary: "Backend-focused support engineer.",
			skills: ["Node.js", "SQL", "Zendesk"],
			experience: [
				{ id: "exp1", bullets: ["Built triage macros", "Cut MTTR"] },
			],
			label: "Stripe — Backend",
			targetCompany: "Stripe",
			targetRole: "Backend",
		});

		expect(patched.summary).toBe("Backend-focused support engineer.");
		expect(patched.skills).toEqual(["Node.js", "SQL", "Zendesk"]);
		expect(patched.experience[0]).toMatchObject({
			id: "exp1",
			title: "Support Lead",
			company: "Acme",
			location: "Remote",
			startDate: "2020",
			endDate: "Present",
			bullets: ["Built triage macros", "Cut MTTR"],
		});
		expect(patched.label).toBe("Stripe — Backend");
		expect(patched.targetCompany).toBe("Stripe");
		expect(patched.targetRole).toBe("Backend");
		expect(patched.tailoredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	it("ignores unknown experience ids instead of inventing jobs", () => {
		const patched = applyTailorPatch(baseResume, {
			summary: "x",
			experience: [{ id: "missing", bullets: ["Invented job"] }],
		});
		expect(patched.experience).toEqual(baseResume.experience);
	});
});

describe("buildFallbackTailorPatch", () => {
	it("keeps experience ids and builds a label", () => {
		const patch = buildFallbackTailorPatch({
			resume: baseResume,
			company: "Notion",
			role: "CS Manager",
			jobDescription: "Looking for empathy, Zendesk, and process design.",
		});
		expect(patch.label).toBe("Notion — CS Manager");
		expect(patch.experience?.[0]?.id).toBe("exp1");
		expect(patch.summary?.toLowerCase()).toContain("notion");
		expect(patch.skills?.length).toBeGreaterThan(0);
	});
});

describe("parseTailorModelJson", () => {
	it("parses a JSON object from model text", () => {
		const parsed = parseTailorModelJson(
			'Here you go:\n{"summary":"A","skills":["SQL"],"experience":[{"id":"exp1","bullets":["Did X"]}]}\n',
		);
		expect(parsed).toEqual({
			summary: "A",
			skills: ["SQL"],
			experience: [{ id: "exp1", bullets: ["Did X"] }],
		});
	});

	it("returns null for invalid payloads", () => {
		expect(parseTailorModelJson("not json")).toBeNull();
	});
});
