import { quizAttemptRepository, quizRepository, settingsRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("quiz repositories", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("persists quizzes, questions, attempts, and answers", async () => {
    const created = await quizRepository.create({
      sourceFileId: "file-1",
      extractedDocumentId: "doc-1",
      sourceFingerprint: "fingerprint-1",
      title: "Distributed systems quiz",
      questionCount: 2,
      mode: "mixed",
      focusMode: "balanced",
      includeExplanations: true,
      questions: [
        {
          type: "multiple_choice",
          prompt: "Which term best completes this statement?\n_____ improves resilience.",
          choices: ["Replication", "Consensus", "Caching", "Latency"],
          correctAnswer: "Replication",
          explanation: "Replication improves resilience.",
          sourceHint: "Replication section",
          focusTag: "balanced",
          order: 0,
        },
        {
          type: "true_false",
          prompt: "Consensus helps distributed systems agree on a value.",
          choices: ["true", "false"],
          correctAnswer: "true",
          explanation: "Consensus helps agreement.",
          sourceHint: "Consensus section",
          focusTag: "key_concepts",
          order: 1,
        },
      ],
    });

    const attempt = await quizAttemptRepository.startAttempt(created.quiz.id, created.questions.length, created.quiz.mode);
    await quizAttemptRepository.completeAttempt(
      attempt.id,
      [
        { questionId: created.questions[0]!.id, answer: "Replication", isCorrect: true },
        { questionId: created.questions[1]!.id, answer: "false", isCorrect: false },
      ],
      1,
      2,
    );

    const [quizzes, questions, attempts, answers] = await Promise.all([
      quizRepository.listByFile("file-1"),
      quizRepository.getQuestions(created.quiz.id),
      quizAttemptRepository.listByQuiz(created.quiz.id),
      quizAttemptRepository.getAnswers(attempt.id),
    ]);

    expect(quizzes).toHaveLength(1);
    expect(questions).toHaveLength(2);
    expect(attempts[0]?.score).toBe(50);
    expect(answers).toHaveLength(2);
  });
});
