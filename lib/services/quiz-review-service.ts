import { fileRepository, quizAttemptRepository, quizRepository } from "@/lib/repositories";
import { isFingerprintStale } from "@/lib/services/summary-staleness";

export class QuizReviewService {
  async getHistoryForFile(fileId: string) {
    const file = await fileRepository.getById(fileId);

    if (!file) {
      throw new Error("missing_source_file");
    }

    const quizzes = await quizRepository.listByFile(fileId);

    return Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await quizAttemptRepository.listByQuiz(quiz.id);
        return {
          ...quiz,
          stale: isFingerprintStale(file.contentFingerprint, quiz.sourceFingerprint),
          attemptCount: attempts.length,
          latestAttempt: attempts[0] ?? null,
        };
      }),
    );
  }

  async getQuizView(quizId: string) {
    const quiz = await quizRepository.getById(quizId);

    if (!quiz) {
      throw new Error("missing_quiz");
    }

    const [file, questions, attempts] = await Promise.all([
      fileRepository.getById(quiz.sourceFileId),
      quizRepository.getQuestions(quizId),
      quizAttemptRepository.listByQuiz(quizId),
    ]);

    return {
      quiz,
      questions,
      attempts,
      stale: file ? isFingerprintStale(file.contentFingerprint, quiz.sourceFingerprint) : false,
      missingSourceFile: !file,
    };
  }

  async getAttemptReview(attemptId: string) {
    const attempt = await quizAttemptRepository.getAttemptById(attemptId);

    if (!attempt) {
      throw new Error("missing_attempt");
    }

    const quizView = await this.getQuizView(attempt.quizId);
    const answers = await quizAttemptRepository.getAnswers(attemptId);
    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));

    return {
      attempt,
      quiz: quizView.quiz,
      stale: quizView.stale,
      missingSourceFile: quizView.missingSourceFile,
      questions: quizView.questions.map((question) => ({
        question,
        answer: answerMap.get(question.id) ?? null,
      })),
    };
  }
}

export const quizReviewService = new QuizReviewService();
