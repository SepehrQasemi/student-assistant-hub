import { normalizeQuizAnswer } from "@/lib/services/answer-normalizer";
import type { QuizQuestion } from "@/types/entities";

export function evaluateQuizAnswers(questions: QuizQuestion[], answers: Record<string, string>) {
  const evaluatedAnswers = questions.map((question) => {
    const rawAnswer = answers[question.id] ?? "";
    const isCorrect = normalizeQuizAnswer(question, rawAnswer) === normalizeQuizAnswer(question, question.correctAnswer);

    return {
      questionId: question.id,
      answer: rawAnswer,
      isCorrect,
    };
  });

  const correctCount = evaluatedAnswers.filter((answer) => answer.isCorrect).length;

  return {
    answers: evaluatedAnswers,
    correctCount,
    totalQuestions: questions.length,
  };
}
