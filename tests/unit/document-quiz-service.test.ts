import { documentQuizService } from "@/lib/services/document-quiz-service";
import { quizReviewService } from "@/lib/services/quiz-review-service";
import { fileRepository, settingsRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

async function importQuizSourceFile() {
  const [file] = await fileRepository.importMany([
    {
      file: new File(
        [[
          "# Distributed Systems",
          "Distributed systems coordinate services across multiple machines.",
          "Distributed systems must tolerate failures and network delays.",
          "",
          "# Replication",
          "Replication improves resilience and replication introduces consistency tradeoffs.",
          "",
          "# Consensus",
          "Consensus algorithms help distributed systems agree on a value.",
          "",
          "# Review",
          "Review replication, consensus, and consistency before the exam because those topics are important.",
        ].join("\n")],
        "distributed-systems.md",
        { type: "text/markdown" },
      ),
      category: "lecture_note",
      courseId: null,
      notes: "",
      tagIds: [],
    },
  ]);

  return file!;
}

describe("documentQuizService", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("generates quizzes, stores attempts, and marks quizzes stale after source replacement", async () => {
    const file = await importQuizSourceFile();
    const generated = await documentQuizService.generateForFile(file.id, {
      questionCount: 5,
      mode: "mixed",
      focusMode: "review",
      includeExplanations: true,
    });

    expect(generated.status).toBe("success");
    expect(generated.quiz).toBeTruthy();
    expect(generated.questions).toHaveLength(5);

    const attempt = await documentQuizService.startAttempt(generated.quiz!.id);
    const answerMap = Object.fromEntries(generated.questions.map((question) => [question.id, question.correctAnswer]));
    const submitted = await documentQuizService.submitAttempt(generated.quiz!.id, attempt.id, answerMap);
    const historyBeforeChange = await quizReviewService.getHistoryForFile(file.id);

    expect(submitted.attempt.score).toBe(100);
    expect(historyBeforeChange[0]?.attemptCount).toBe(1);
    expect(historyBeforeChange[0]?.stale).toBe(false);

    await fileRepository.replaceSource(
      file.id,
      new File(["# Distributed Systems\nConsistency and fault tolerance require new review points."], "distributed-systems.md", {
        type: "text/markdown",
      }),
    );

    const historyAfterChange = await quizReviewService.getHistoryForFile(file.id);
    expect(historyAfterChange[0]?.stale).toBe(true);
  });

  it("reports unsupported sources honestly", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File([new Uint8Array([1, 2, 3])], "archive.zip", { type: "application/zip" }),
        category: "other",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    const result = await documentQuizService.generateForFile(file!.id, {
      questionCount: 5,
      mode: "mixed",
      focusMode: "balanced",
      includeExplanations: true,
    });

    expect(result.status).toBe("unsupported");
    expect(result.quiz).toBeNull();
  });
});
