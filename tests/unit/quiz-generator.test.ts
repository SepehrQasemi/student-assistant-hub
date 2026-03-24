import { buildQuestionCandidates } from "@/lib/services/question-candidate-service";
import { generateQuizQuestions } from "@/lib/services/quiz-generator";
import type { QuizSourceMaterial } from "@/lib/services/quiz-source-service";

const quizSource: QuizSourceMaterial = {
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
    characterCount: 400,
    chunkCount: 2,
    errorMessage: null,
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
  chunks: [],
  sections: [
    {
      index: 0,
      title: "Replication",
      content: "Replication improves resilience and replication introduces consistency tradeoffs.",
      sentences: [
        "Replication improves resilience and replication introduces consistency tradeoffs.",
      ],
    },
    {
      index: 1,
      title: "Consensus",
      content: "Consensus algorithms help distributed systems agree on a value.",
      sentences: ["Consensus algorithms help distributed systems agree on a value."],
    },
  ],
  concepts: [
    { term: "replication", score: 5.2, occurrences: 3 },
    { term: "resilience", score: 4.5, occurrences: 3 },
    { term: "consistency", score: 4.2, occurrences: 2 },
    { term: "consensus", score: 4.1, occurrences: 2 },
    { term: "distributed systems", score: 4.7, occurrences: 2 },
  ],
  summaryHints: [],
};

describe("generateQuizQuestions", () => {
  it("builds mixed quizzes with MCQ and true/false questions", () => {
    const candidates = buildQuestionCandidates(quizSource, "balanced");
    const questions = generateQuizQuestions(quizSource, candidates, {
      questionCount: 4,
      mode: "mixed",
      focusMode: "balanced",
      includeExplanations: true,
    });

    expect(questions).toHaveLength(4);
    expect(questions.some((question) => question.type === "multiple_choice")).toBe(true);
    expect(questions.some((question) => question.type === "true_false")).toBe(true);
    expect(questions.find((question) => question.type === "multiple_choice")?.choices).toHaveLength(4);
  });
});
