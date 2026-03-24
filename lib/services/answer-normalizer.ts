import type { QuizQuestion } from "@/types/entities";

export function normalizeQuizAnswer(question: QuizQuestion, answer: string) {
  const trimmed = answer.trim();

  if (question.type === "true_false") {
    const lowered = trimmed.toLowerCase();

    if (["true", "vrai"].includes(lowered)) {
      return "true";
    }

    if (["false", "faux"].includes(lowered)) {
      return "false";
    }
  }

  return trimmed.toLowerCase();
}
