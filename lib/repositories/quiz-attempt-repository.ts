import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { QuizAnswer, QuizAttempt, QuizMode } from "@/types/entities";

export interface AttemptAnswerInput {
  questionId: string;
  answer: string;
  isCorrect: boolean;
}

export class QuizAttemptRepository {
  async startAttempt(quizId: string, totalQuestions: number, mode: QuizMode) {
    const timestamp = nowIso();
    const attempt: QuizAttempt = {
      id: createId(),
      quizId,
      startedAt: timestamp,
      completedAt: null,
      score: null,
      totalQuestions,
      correctCount: 0,
      incorrectCount: 0,
      mode,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.quizAttempts.add(attempt);
    return attempt;
  }

  async completeAttempt(attemptId: string, answers: AttemptAnswerInput[], correctCount: number, totalQuestions: number) {
    const existing = await db.quizAttempts.get(attemptId);

    if (!existing) {
      throw new Error("missing_attempt");
    }

    const timestamp = nowIso();
    const score = totalQuestions === 0 ? 0 : Number(((correctCount / totalQuestions) * 100).toFixed(1));
    const attempt: QuizAttempt = {
      ...existing,
      completedAt: timestamp,
      score,
      correctCount,
      incorrectCount: Math.max(totalQuestions - correctCount, 0),
      totalQuestions,
      updatedAt: timestamp,
    };

    const persistedAnswers: QuizAnswer[] = answers.map((answer) => ({
      id: createId(),
      attemptId,
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect: answer.isCorrect,
      evaluatedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    await db.transaction("rw", db.quizAttempts, db.quizAnswers, async () => {
      await db.quizAttempts.put(attempt);
      await db.quizAnswers.where("attemptId").equals(attemptId).delete();
      if (persistedAnswers.length > 0) {
        await db.quizAnswers.bulkAdd(persistedAnswers);
      }
    });

    return { attempt, answers: persistedAnswers };
  }

  async getAttemptById(id: string) {
    return db.quizAttempts.get(id);
  }

  async listByQuiz(quizId: string) {
    const attempts = await db.quizAttempts.where("quizId").equals(quizId).toArray();
    return attempts.sort((left, right) => right.startedAt.localeCompare(left.startedAt));
  }

  async getAnswers(attemptId: string) {
    return db.quizAnswers.where("attemptId").equals(attemptId).toArray();
  }
}

export const quizAttemptRepository = new QuizAttemptRepository();
