import { generateDistractors } from "@/lib/services/distractor-generator";

describe("generateDistractors", () => {
  it("returns plausible non-duplicate distractors from concept artifacts", () => {
    const distractors = generateDistractors("replication", [
      { term: "replication", score: 5, occurrences: 3 },
      { term: "consistency", score: 4.8, occurrences: 3 },
      { term: "resilience", score: 4.1, occurrences: 2 },
      { term: "consensus", score: 3.9, occurrences: 2 },
      { term: "latency", score: 3.5, occurrences: 2 },
    ]);

    expect(distractors).toHaveLength(3);
    expect(distractors).not.toContain("replication");
  });
});
