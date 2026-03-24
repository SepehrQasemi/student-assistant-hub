import { generateLocalSummary } from "@/lib/services/local-summarizer";

const sampleText = [
  "# Databases",
  "Databases organize information for applications and reporting. Database design controls how data remains consistent.",
  "",
  "# Transactions",
  "Transactions protect consistency and are important during concurrent updates. Important exam topics usually include isolation and atomicity.",
  "",
  "# Revision",
  "Review the definitions of primary keys, normalization, and transactions before the exam.",
].join("\n");

describe("local summarizer", () => {
  it("generates a quick summary", () => {
    const summary = generateLocalSummary(sampleText, "quick_summary");

    expect(summary.overview).toContain("Databases organize information");
    expect(summary.sections[0]?.sectionKey).toBe("overview");
  });

  it("generates a structured summary", () => {
    const summary = generateLocalSummary(sampleText, "structured_summary");

    expect(summary.sections.map((section) => section.sectionKey)).toEqual(["mainTopics", "keyIdeas", "importantDetails"]);
    expect(summary.concepts.length).toBeGreaterThan(0);
  });

  it("generates study notes and key concepts outputs", () => {
    const studyNotes = generateLocalSummary(sampleText, "study_notes");
    const keyConcepts = generateLocalSummary(sampleText, "key_concepts");

    expect(studyNotes.sections.map((section) => section.sectionKey)).toEqual(["overview", "reviewFirst", "watchFor"]);
    expect(keyConcepts.sections[0]?.sectionKey).toBe("concepts");
    expect(keyConcepts.concepts.length).toBeGreaterThan(0);
  });
});
