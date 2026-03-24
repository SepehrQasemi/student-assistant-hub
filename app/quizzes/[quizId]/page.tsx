import { QuizSessionPageClient } from "@/components/quizzes/quiz-session-page-client";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;

  return <QuizSessionPageClient quizId={quizId} />;
}
