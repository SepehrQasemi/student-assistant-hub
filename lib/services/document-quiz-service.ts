import { quizAttemptRepository, quizRepository } from "@/lib/repositories";
import { buildQuestionCandidates } from "@/lib/services/question-candidate-service";
import { generateQuizQuestions } from "@/lib/services/quiz-generator";
import { evaluateQuizAnswers } from "@/lib/services/quiz-evaluator";
import { quizReviewService } from "@/lib/services/quiz-review-service";
import { quizSourceService } from "@/lib/services/quiz-source-service";
import type { QuizGenerationOptions } from "@/types/entities";

export class DocumentQuizService {
  async generateForFile(fileId: string, options: QuizGenerationOptions) {
    const sourceResult = await quizSourceService.getSourceMaterial(fileId);

    if (!sourceResult.source) {
      return {
        status: sourceResult.extractedDocument.status,
        extractedDocument: sourceResult.extractedDocument,
        quiz: null,
        questions: [],
      } as const;
    }

    const existingQuiz = await quizRepository.findCurrentMatch(fileId, sourceResult.source.extractedDocument.sourceFingerprint, options);

    if (existingQuiz) {
      return {
        status: "success",
        extractedDocument: sourceResult.source.extractedDocument,
        quiz: existingQuiz,
        questions: await quizRepository.getQuestions(existingQuiz.id),
      } as const;
    }

    const candidates = buildQuestionCandidates(sourceResult.source, options.focusMode);
    const generatedQuestions = generateQuizQuestions(sourceResult.source, candidates, options);

    if (generatedQuestions.length < options.questionCount) {
      return {
        status: "insufficient_content",
        extractedDocument: sourceResult.source.extractedDocument,
        quiz: null,
        questions: [],
      } as const;
    }

    const created = await quizRepository.create({
      sourceFileId: fileId,
      extractedDocumentId: sourceResult.source.extractedDocument.id,
      sourceFingerprint: sourceResult.source.extractedDocument.sourceFingerprint,
      title: `${sourceResult.file.name} quiz`,
      ...options,
      questions: generatedQuestions,
    });

    return {
      status: "success",
      extractedDocument: sourceResult.source.extractedDocument,
      quiz: created.quiz,
      questions: created.questions,
    } as const;
  }

  async startAttempt(quizId: string) {
    const view = await quizReviewService.getQuizView(quizId);
    return quizAttemptRepository.startAttempt(quizId, view.questions.length, view.quiz.mode);
  }

  async submitAttempt(quizId: string, attemptId: string, answers: Record<string, string>) {
    const view = await quizReviewService.getQuizView(quizId);
    const evaluated = evaluateQuizAnswers(view.questions, answers);
    const completed = await quizAttemptRepository.completeAttempt(
      attemptId,
      evaluated.answers,
      evaluated.correctCount,
      evaluated.totalQuestions,
    );

    return {
      attempt: completed.attempt,
      answers: completed.answers,
    };
  }
}

export const documentQuizService = new DocumentQuizService();
