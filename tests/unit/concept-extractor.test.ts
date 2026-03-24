import { extractKeyConcepts } from "@/lib/services/concept-extractor";

describe("concept extraction", () => {
  it("returns repeated or weighted terms from the source text", () => {
    const concepts = extractKeyConcepts(
      "# Databases\nDatabase systems store data efficiently. Database design matters for data models and database queries.",
    );

    expect(concepts[0]?.term).toContain("database");
    expect(concepts.some((concept) => concept.term.includes("data"))).toBe(true);
  });
});
