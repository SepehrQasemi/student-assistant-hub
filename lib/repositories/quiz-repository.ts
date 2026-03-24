import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { QuizGenerationOptions, QuizQuestion, QuizRecord } from "@/types/entities";

export interface QuizCreateInput extends QuizGenerationOptions {
  sourceFileId: string;
  extractedDocumentId: string;
  sourceFingerprint: string;
  title: string;
  questions: Array<{
    type: QuizQuestion["type"];
    prompt: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
    sourceHint: string;
    focusTag: QuizQuestion["focusTag"];
    order: number;
  }>;
}

export class QuizRepository {
  async create(input: QuizCreateInput) {
    const timestamp = nowIso();
    const quizId = createId();

    const quiz: QuizRecord = {
      id: quizId,
      sourceFileId: input.sourceFileId,
      extractedDocumentId: input.extractedDocumentId,
      sourceFingerprint: input.sourceFingerprint,
      title: input.title,
      mode: input.mode,
      focusMode: input.focusMode,
      includeExplanations: input.includeExplanations,
      questionCount: input.questions.length,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const questions: QuizQuestion[] = input.questions.map((question) => ({
      id: createId(),
      quizId,
      type: question.type,
      prompt: question.prompt,
      choices: question.choices,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      sourceHint: question.sourceHint,
      focusTag: question.focusTag,
      order: question.order,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    await db.transaction("rw", db.quizzes, db.quizQuestions, async () => {
      await db.quizzes.add(quiz);
      await db.quizQuestions.bulkAdd(questions);
    });

    return { quiz, questions };
  }

  async getById(id: string) {
    return db.quizzes.get(id);
  }

  async getQuestions(quizId: string) {
    const questions = await db.quizQuestions.where("quizId").equals(quizId).toArray();
    return questions.sort((left, right) => left.order - right.order);
  }

  async listByFile(sourceFileId: string) {
    const quizzes = await db.quizzes.where("sourceFileId").equals(sourceFileId).toArray();
    return quizzes.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async findCurrentMatch(sourceFileId: string, sourceFingerprint: string, options: QuizGenerationOptions) {
    const quizzes = await db.quizzes.where("[sourceFileId+sourceFingerprint]").equals([sourceFileId, sourceFingerprint]).toArray();

    return quizzes
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .find(
        (quiz) =>
          quiz.mode === options.mode &&
          quiz.focusMode === options.focusMode &&
          quiz.includeExplanations === options.includeExplanations &&
          quiz.questionCount === options.questionCount,
      );
  }
}

export const quizRepository = new QuizRepository();
