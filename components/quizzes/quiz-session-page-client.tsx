"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/providers/i18n-provider";
import { documentQuizService } from "@/lib/services/document-quiz-service";
import { quizReviewService } from "@/lib/services/quiz-review-service";
import { formatLocalizedDateTime } from "@/lib/utils";

type QuizView = Awaited<ReturnType<typeof quizReviewService.getQuizView>>;
type AttemptReview = Awaited<ReturnType<typeof quizReviewService.getAttemptReview>>;
type StartedAttempt = Awaited<ReturnType<typeof documentQuizService.startAttempt>>;

function formatAnswerLabel(value: string, localeKey: (key: string) => string) {
  if (value === "true") {
    return localeKey("quizzes.answers.true");
  }

  if (value === "false") {
    return localeKey("quizzes.answers.false");
  }

  return value || localeKey("quizzes.unanswered");
}

export function QuizSessionPageClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const attemptId = searchParams.get("attempt");

  const [quizView, setQuizView] = useState<QuizView | undefined>(undefined);
  const [attemptReview, setAttemptReview] = useState<AttemptReview | undefined>(undefined);
  const [activeAttempt, setActiveAttempt] = useState<StartedAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "starting" | "submitting" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    void quizReviewService
      .getQuizView(quizId)
      .then((view) => {
        if (cancelled) {
          return;
        }

        setQuizView(view);
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  useEffect(() => {
    let cancelled = false;

    if (!attemptId) {
      return () => {
        cancelled = true;
      };
    }

    void quizReviewService
      .getAttemptReview(attemptId)
      .then((review) => {
        if (cancelled) {
          return;
        }

        setAttemptReview(review);
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const activeQuestion = useMemo(() => {
    if (!quizView || attemptReview || !activeAttempt) {
      return null;
    }

    return quizView.questions[currentIndex] ?? null;
  }, [quizView, attemptReview, activeAttempt, currentIndex]);

  async function handleStart() {
    if (!quizView) {
      return;
    }

    setStatus("starting");

    try {
      const attempt = await documentQuizService.startAttempt(quizId);
      setActiveAttempt(attempt);
      setAnswers({});
      setCurrentIndex(0);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function handleSubmit() {
    if (!quizView || !activeAttempt) {
      return;
    }

    setStatus("submitting");

    try {
      const result = await documentQuizService.submitAttempt(quizId, activeAttempt.id, answers);
      router.replace(`/quizzes/${quizId}?attempt=${result.attempt.id}`);
      setActiveAttempt(null);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function startRetry() {
    setAttemptReview(undefined);
    setActiveAttempt(null);
    setAnswers({});
    setCurrentIndex(0);
    router.replace(`/quizzes/${quizId}`);
  }

  if (status === "error") {
    return (
      <Card>
        <CardContent className="py-12 text-sm text-slate-600">{t("quizzes.errors.missingQuiz")}</CardContent>
      </Card>
    );
  }

  if (!quizView || (attemptId && !attemptReview)) {
    return (
      <Card>
        <CardContent className="py-12 text-sm text-slate-600">{t("common.loading")}</CardContent>
      </Card>
    );
  }

  if (attemptReview) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={quizView.quiz.title}
          subtitle={t("quizzes.reviewSubtitle")}
          actions={
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/files">{t("quizzes.backToFiles")}</Link>
              </Button>
              <Button onClick={startRetry}>{t("quizzes.retryAction")}</Button>
            </div>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("quizzes.resultsTitle")}</CardTitle>
            <CardDescription>{t("quizzes.resultsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{t("quizzes.scoreValue", { score: attemptReview.attempt.score?.toFixed(0) ?? "0" })}</Badge>
              <Badge variant="muted">{t("quizzes.correctCount", { count: attemptReview.attempt.correctCount })}</Badge>
              <Badge variant="muted">{t("quizzes.incorrectCount", { count: attemptReview.attempt.incorrectCount })}</Badge>
              {attemptReview.stale ? <Badge variant="danger">{t("quizzes.staleWarning")}</Badge> : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {attemptReview.questions.map(({ question, answer }, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("quizzes.questionNumber", { current: index + 1, total: attemptReview.questions.length })}
                  </CardTitle>
                  <CardDescription>{question.prompt}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">{t("quizzes.yourAnswer")}:</span>{" "}
                    {formatAnswerLabel(answer?.answer ?? "", t)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">{t("quizzes.correctAnswer")}:</span>{" "}
                    {formatAnswerLabel(question.correctAnswer, t)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">{t("quizzes.reviewStatus")}:</span>{" "}
                    {answer?.isCorrect ? t("quizzes.answerStatus.correct") : t("quizzes.answerStatus.incorrect")}
                  </p>
                  {question.explanation ? (
                    <p>
                      <span className="font-medium text-slate-900">{t("quizzes.explanationLabel")}:</span> {question.explanation}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("quizzes.attemptHistoryTitle")}</CardTitle>
              <CardDescription>{t("quizzes.attemptHistoryDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quizView.attempts.map((attempt) => (
                <Button key={attempt.id} asChild variant={attempt.id === attemptReview.attempt.id ? "default" : "secondary"} className="w-full justify-between">
                  <Link href={`/quizzes/${quizId}?attempt=${attempt.id}`}>
                    <span>{formatLocalizedDateTime(attempt.startedAt, locale)}</span>
                    <span>{t("quizzes.scoreValue", { score: attempt.score?.toFixed(0) ?? "0" })}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={quizView.quiz.title}
        subtitle={t("quizzes.playerSubtitle")}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/files">{t("quizzes.backToFiles")}</Link>
            </Button>
            {quizView.stale ? <Badge variant="danger">{t("quizzes.staleWarning")}</Badge> : null}
          </div>
        }
      />

      {!activeAttempt ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("quizzes.startTitle")}</CardTitle>
            <CardDescription>{t("quizzes.startDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{t(`quizzes.modes.${quizView.quiz.mode}`)}</Badge>
              <Badge variant="muted">{t(`quizzes.focusModes.${quizView.quiz.focusMode}`)}</Badge>
              <Badge variant="muted">{t("quizzes.questionsWithCount", { count: quizView.questions.length })}</Badge>
            </div>
            <Button onClick={() => void handleStart()} disabled={status === "starting"}>
              {status === "starting" ? t("common.loading") : t("quizzes.startAction")}
            </Button>
          </CardContent>
        </Card>
      ) : activeQuestion ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("quizzes.questionNumber", { current: currentIndex + 1, total: quizView.questions.length })}</CardTitle>
            <CardDescription>{activeQuestion.prompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {activeQuestion.choices.map((choice) => {
                const selected = answers[activeQuestion.id] === choice;

                return (
                  <Button
                    key={choice}
                    type="button"
                    variant={selected ? "default" : "secondary"}
                    className="w-full justify-start text-left whitespace-normal py-3 h-auto"
                    onClick={() => setAnswers((current) => ({ ...current, [activeQuestion.id]: choice }))}
                  >
                    {formatAnswerLabel(choice, t)}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="secondary" onClick={() => setCurrentIndex((current) => Math.max(current - 1, 0))} disabled={currentIndex === 0}>
                {t("quizzes.previousQuestion")}
              </Button>

              {currentIndex === quizView.questions.length - 1 ? (
                <Button type="button" onClick={() => void handleSubmit()} disabled={status === "submitting"}>
                  {status === "submitting" ? t("common.loading") : t("quizzes.submitAction")}
                </Button>
              ) : (
                <Button type="button" onClick={() => setCurrentIndex((current) => Math.min(current + 1, quizView.questions.length - 1))}>
                  {t("quizzes.nextQuestion")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
