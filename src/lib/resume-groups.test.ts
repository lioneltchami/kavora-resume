import { describe, expect, it } from "vitest";
import {
  groupResumesForDashboard,
  portfolioSlugForResume,
} from "./resume-groups";

describe("groupResumesForDashboard", () => {
  it("nests tailored children under their parent", () => {
    const groups = groupResumesForDashboard([
      {
        slug: "jane-base",
        name: "Jane",
        savedAt: "2026-01-02T00:00:00.000Z",
      },
      {
        slug: "jane-stripe",
        name: "Jane",
        label: "Stripe — Backend",
        parentSlug: "jane-base",
        savedAt: "2026-01-03T00:00:00.000Z",
      },
      {
        slug: "orphan",
        name: "Orphan",
        parentSlug: "missing",
        savedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].parent.slug).toBe("jane-base");
    expect(groups[0].children.map((c) => c.slug)).toEqual(["jane-stripe"]);
    expect(groups[1].parent.slug).toBe("orphan");
  });
});

describe("portfolioSlugForResume", () => {
  it("points tailored copies at their base slug", () => {
    expect(
      portfolioSlugForResume({
        slug: "jane-stripe",
        parentSlug: "jane-base",
      }),
    ).toBe("jane-base");
    expect(portfolioSlugForResume({ slug: "jane-base" })).toBe("jane-base");
  });
});
