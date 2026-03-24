import { chunkDocumentText } from "@/lib/services/document-chunker";

describe("document chunking", () => {
  it("chunks text deterministically while preserving heading blocks", () => {
    const text = [
      "# Topic One",
      "This is a first paragraph that contains enough text to stay with the heading and should remain grouped.",
      "",
      "# Topic Two",
      "This is a second paragraph with more content and enough length to force another chunk when the limit is small.",
    ].join("\n");

    const chunks = chunkDocumentText(text, { maxChars: 120, minChars: 40 });

    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.text).toContain("# Topic One");
    expect(chunks[1]?.text).toContain("# Topic Two");
  });
});
