import { evaluateQuizAnswers } from "@/lib/services/quiz-evaluator";
import type { QuizQuestion } from "@/types/entities";

const questions: QuizQuestion[] = [
  {
    id: "q1",
    quizId: "quiz-1",
    type: "multiple_choice",
    prompt: "Which term best completes this statement?",
    choices: ["Replication", "Consensus", "Latency", "Caching"],
    correctAnswer: "Replication",
    explanation: "",
    sourceHint: "Replication section",
    focusTag: "balanced",
    order: 0,
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
  {
    id: "q2",
    quizId: "quiz-1",
    type: "true_false",
    prompt: "Consensus helps distributed systems agree on a value.",
    choices: ["true", "false"],
    correctAnswer: "true",
    explanation: "",
    sourceHint: "Consensus section",
    focusTag: "key_concepts",
    order: 1,
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z",
  },
];

describe("evaluateQuizAnswers", () => {
  it("scores stored answers with normalization", () => {
    const result = evaluateQuizAnswers(questions, {
      q1: "Replication",
      q2: "Vrai",
    });

    expect(result.correctCount).toBe(2);
    expect(result.totalQuestions).toBe(2);
    expect(result.answers.every((answer) => answer.isCorrect)).toBe(true);
  });
});
