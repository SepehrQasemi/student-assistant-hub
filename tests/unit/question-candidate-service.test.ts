import { buildQuestionCandidates } from "@/lib/services/question-candidate-service";
import type { QuizSourceMaterial } from "@/lib/services/quiz-source-service";

const source: QuizSourceMaterial = {
  file: {
    id: "file-1",
    name: "distributed-systems",
    originalName: "distributed-systems.md",
    courseId: null,
    category: "lecture_note",
    mimeType: "text/markdown",
    extension: "md",
    sizeBytes: 100,
    notes: "",
    tagIds: [],
    blobId: "blob-1",
    importedAt: "2026-03-24T00:00:00.000Z",
    previewKind: "text",
    contentFingerprint: "fingerprint",
    contentUpdatedAt: "2026-03-24T00:00:00.000Z",
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z",
    deletedAt: null,
  },
  extractedDocument: {
    id: "doc-1",
    fileId: "file-1",
    sourceFingerprint: "fingerprint",
    sourceUpdatedAt: "2026-03-24T00:00:00.000Z",
    documentType: "markdown",
    status: "success",
    rawText: "",
    normalizedText: "",
    characterCount: 120,
    chunkCount: 1,
    errorMessage: null,
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
  chunks: [{ index: 0, text: "Replication improves resilience before the exam.", charCount: 52 }],
  sections: [
    {
      index: 0,
      title: "Replication",
      content: "Replication improves resilience before the exam.",
      sentences: ["Replication improves resilience before the exam."],
    },
  ],
  concepts: [
    { term: "replication", score: 5, occurrences: 3 },
    { term: "resilience", score: 3.2, occurrences: 2 },
  ],
  summaryHints: [{ sectionKey: "reviewFirst", content: "Review replication before the exam." }],
};

describe("buildQuestionCandidates", () => {
  it("creates masked candidates with review-aware scoring", () => {
    const candidates = buildQuestionCandidates(source, "review");

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]?.maskedSentence).toContain("_____");
    expect(candidates[0]?.focusTag).toBe("review");
    expect(candidates[0]?.score).toBeGreaterThan(0);
  });
});
