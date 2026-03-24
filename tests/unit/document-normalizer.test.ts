import { normalizeExtractedText } from "@/lib/services/document-normalizer";

describe("document normalization", () => {
  it("normalizes line endings, merges wrapped lines, and preserves structure", () => {
    const normalized = normalizeExtractedText("# Heading\r\nLine one\r\nline two\r\n\r\nword-\nwrapped");

    expect(normalized).toBe("# Heading\nLine one line two\n\nwordwrapped");
  });
});
