import { describe, expect, it } from "vitest";
import {
  buildEmailShareUrl,
  buildLinkedInShareUrl,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  resumeShareText,
} from "./share";

describe("share helpers", () => {
  const url = "https://kavoraresume.cv/r/jane";

  it("builds channel URLs", () => {
    expect(buildLinkedInShareUrl(url)).toContain(
      "linkedin.com/sharing/share-offsite/?url=",
    );
    expect(buildWhatsAppShareUrl(url, "Check this")).toContain("wa.me/?text=");
    expect(buildTwitterShareUrl(url, "Check this")).toContain(
      "twitter.com/intent/tweet",
    );
    expect(buildEmailShareUrl(url, "My resume", "Hello")).toContain(
      "mailto:?subject=",
    );
  });

  it("builds default share text", () => {
    expect(resumeShareText("Jane")).toContain("Jane");
    expect(resumeShareText("")).toContain("professional resume");
  });
});
