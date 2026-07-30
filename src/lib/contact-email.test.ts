import { describe, expect, it } from "vitest";
import {
  buildContactEmailPayload,
  portfolioMessagesInboxUrl,
  resolveContactFromEmail,
  sanitizeEmailField,
} from "./contact-email";

describe("contact email helpers", () => {
  it("sanitizes subject-related fields", () => {
    expect(sanitizeEmailField("Jane\nDoe\tAcme")).toBe("Jane Doe Acme");
    expect(sanitizeEmailField("  lots   of   space  ")).toBe("lots of space");
    expect(sanitizeEmailField("x".repeat(200), 10)).toBe("x".repeat(10));
  });

  it("builds inbox deep link", () => {
    expect(portfolioMessagesInboxUrl("https://kavoraresume.cv")).toBe(
      "https://kavoraresume.cv/create/portfolio?tab=messages",
    );
  });

  it("builds email payload with reply-to and inbox link", () => {
    const payload = buildContactEmailPayload({
      from: "Kavora <notifications@kavoraresume.cv>",
      ownerEmail: "owner@example.com",
      slug: "jane",
      senderName: "Recruiter\nName",
      senderEmail: "hire@acme.com",
      message: "We liked your portfolio.",
      inboxUrl: "https://kavoraresume.cv/create/portfolio?tab=messages",
    });

    expect(payload.to).toEqual(["owner@example.com"]);
    expect(payload.reply_to).toBe("hire@acme.com");
    expect(payload.subject).toBe(
      "New message from Recruiter Name on your Kavora portfolio",
    );
    expect(payload.subject).not.toMatch(/[\r\n]/);
    expect(payload.text).toContain("/p/jane");
    expect(payload.text).toContain("We liked your portfolio.");
    expect(payload.text).toContain(
      "Open inbox: https://kavoraresume.cv/create/portfolio?tab=messages",
    );
  });

  it("resolves from address with fallback", () => {
    expect(resolveContactFromEmail("Kavora <a@b.com>")).toBe(
      "Kavora <a@b.com>",
    );
    expect(resolveContactFromEmail("")).toBe("Kavora <onboarding@resend.dev>");
    expect(resolveContactFromEmail(undefined)).toBe(
      "Kavora <onboarding@resend.dev>",
    );
  });
});
