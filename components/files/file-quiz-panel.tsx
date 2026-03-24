"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { extractedDocumentRepository } from "@/lib/repositories";
import { useI18n } from "@/lib/providers/i18n-provider";
import { documentQuizService } from "@/lib/services/document-quiz-service";
import { quizReviewService } from "@/lib/services/quiz-review-service";
import { formatLocalizedDateTime } from "@/lib/utils";
import type { QuizGenerationOptions, StoredFileRecord } from "@/types/entities";

const defaultOptions: QuizGenerationOptions = {
  questionCount: 5,
  mode: "mixed",
  focusMode: "balanced",
  includeExplanations: true,
};

function formatScore(score: number | null) {
  return score === null ? "-" : `${score.toFixed(0)}%`;
}

export function FileQuizPanel({ file }: { file: StoredFileRecord }) {
  const { t, locale } = useI18n();
  const [options, setOptions] = useState<QuizGenerationOptions>(defaultOptions);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<
    "idle" | "generating" | "success" | "insufficient_content" | "error" | "pending" | "failed" | "unsupported" | "empty"
  >("idle");

  const history = useLiveQuery(() => quizReviewService.getHistoryForFile(file.id), [file.id, file.contentFingerprint], []);
  const currentExtraction = useLiveQuery(
    () => extractedDocumentRepository.findByFileAndFingerprint(file.id, file.contentFingerprint),
    [file.id, file.contentFingerprint],
    undefined,
  );
  const resolvedSelectedQuizId = useMemo(() => {
    if (history.length === 0) {
      return null;
    }

    return selectedQuizId && history.some((quiz) => quiz.id === selectedQuizId) ? selectedQuizId : history[0]!.id;
  }, [history, selectedQuizId]);
  const quizView = useLiveQuery(
    () => (resolvedSelectedQuizId ? quizReviewService.getQuizView(resolvedSelectedQuizId) : Promise.resolve(undefined)),
    [resolvedSelectedQuizId, file.contentFingerprint],
    undefined,
  );

  async function handleGenerate() {
    setGenerationState("generating");

    try {
      const result = await documentQuizService.generateForFile(file.id, options);

      if (result.status === "success" && result.quiz) {
        setSelectedQuizId(result.quiz.id);
      }

      setGenerationState(result.status);
    } catch {
      setGenerationState("error");
    }
  }

  function renderStatusMessage() {
    if (generationState === "generating") {
      return t("quizzes.generating");
    }

    if (generationState === "error") {
      return t("quizzes.errors.generationFailed");
    }

    if (generationState === "insufficient_content") {
      return t("quizzes.insufficientContent");
    }

    if (generationState !== "idle" && generationState !== "success") {
      return t(`quizzes.sourceStates.${generationState}`);
    }

    if (!currentExtraction) {
      return t("quizzes.readyDescription");
    }

    if (currentExtraction.status === "success") {
      return t("quizzes.extractionReadyDescription", {
        chars: currentExtraction.characterCount,
        chunks: currentExtraction.chunkCount,
      });
    }

    return t(`quizzes.sourceStates.${currentExtraction.status}`);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("quizzes.title")}</CardTitle>
          <CardDescription>{t("quizzes.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {quizView ? (
              <Badge variant={quizView.stale ? "danger" : "accent"}>
                {quizView.stale ? t("quizzes.staleBadge") : t("quizzes.currentBadge")}
              </Badge>
            ) : null}
            {currentExtraction ? <Badge variant="muted">{t(`summaries.documentTypes.${currentExtraction.documentType}`)}</Badge> : null}
          </div>
          <p className="text-sm text-slate-600">{renderStatusMessage()}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("quizzes.options.questionCount")}</Label>
              <Select
                value={String(options.questionCount)}
                onValueChange={(value) =>
                  setOptions((current) => ({ ...current, questionCount: Number(value) as QuizGenerationOptions["questionCount"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("quizzes.options.mode")}</Label>
              <Select value={options.mode} onValueChange={(value) => setOptions((current) => ({ ...current, mode: value as QuizGenerationOptions["mode"] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">{t("quizzes.modes.mixed")}</SelectItem>
                  <SelectItem value="multiple_choice">{t("quizzes.modes.multiple_choice")}</SelectItem>
                  <SelectItem value="true_false">{t("quizzes.modes.true_false")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("quizzes.options.focusMode")}</Label>
              <Select
                value={options.focusMode}
                onValueChange={(value) => setOptions((current) => ({ ...current, focusMode: value as QuizGenerationOptions["focusMode"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">{t("quizzes.focusModes.balanced")}</SelectItem>
                  <SelectItem value="key_concepts">{t("quizzes.focusModes.key_concepts")}</SelectItem>
                  <SelectItem value="review">{t("quizzes.focusModes.review")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">{t("quizzes.options.includeExplanations")}</p>
                <p className="text-sm text-slate-600">{t("quizzes.options.includeExplanationsHelp")}</p>
              </div>
              <Switch checked={options.includeExplanations} onCheckedChange={(checked) => setOptions((current) => ({ ...current, includeExplanations: checked }))} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void handleGenerate()} disabled={generationState === "generating"}>
              {generationState === "generating" ? t("quizzes.generating") : t("quizzes.generateAction")}
            </Button>
            <p className="max-w-2xl text-sm text-slate-600">{t("quizzes.shortAnswerDeferred")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("quizzes.historyTitle")}</CardTitle>
            <CardDescription>{t("quizzes.historyDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-slate-600">{t("quizzes.historyEmpty")}</p>
            ) : (
              history.map((quiz) => (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    resolvedSelectedQuizId === quiz.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/60"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{quiz.title}</p>
                    <Badge variant={quiz.stale ? "danger" : "accent"}>{quiz.stale ? t("quizzes.staleBadge") : t("quizzes.currentBadge")}</Badge>
                  </div>
                  <p className={`mt-2 text-xs ${resolvedSelectedQuizId === quiz.id ? "text-slate-200" : "text-slate-500"}`}>
                    {t(`quizzes.modes.${quiz.mode}`)} - {quiz.questionCount} {t("quizzes.questionsLabel")} - {t(`quizzes.focusModes.${quiz.focusMode}`)}
                  </p>
                  <p className={`mt-1 text-xs ${resolvedSelectedQuizId === quiz.id ? "text-slate-200" : "text-slate-500"}`}>
                    {t("quizzes.attemptCount", { count: quiz.attemptCount })} - {t("quizzes.latestScore", { score: formatScore(quiz.latestAttempt?.score ?? null) })}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("quizzes.viewerTitle")}</CardTitle>
            <CardDescription>{t("quizzes.viewerDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resolvedSelectedQuizId || !quizView ? (
              <p className="text-sm text-slate-600">{t("quizzes.viewerEmpty")}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{t(`quizzes.modes.${quizView.quiz.mode}`)}</Badge>
                  <Badge variant="muted">{t(`quizzes.focusModes.${quizView.quiz.focusMode}`)}</Badge>
                  {quizView.stale ? <Badge variant="danger">{t("quizzes.staleWarning")}</Badge> : null}
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{quizView.quiz.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span>{quizView.questions.length} {t("quizzes.questionsLabel")}</span>
                    <span>{t("quizzes.attemptCount", { count: quizView.attempts.length })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/quizzes/${quizView.quiz.id}`}>{t("quizzes.startAction")}</Link>
                  </Button>
                  {quizView.attempts[0] ? (
                    <Button asChild variant="secondary">
                      <Link href={`/quizzes/${quizView.quiz.id}?attempt=${quizView.attempts[0]!.id}`}>{t("quizzes.openLatestAttempt")}</Link>
                    </Button>
                  ) : null}
                </div>

                {quizView.attempts.length > 0 ? (
                  <div className="space-y-3 rounded-[22px] border border-slate-200 p-4">
                    <p className="text-sm font-medium text-slate-900">{t("quizzes.attemptHistoryTitle")}</p>
                    <div className="space-y-2">
                      {quizView.attempts.slice(0, 4).map((attempt) => (
                        <Button key={attempt.id} asChild variant="secondary" className="w-full justify-between">
                          <Link href={`/quizzes/${quizView.quiz.id}?attempt=${attempt.id}`}>
                            <span>{formatLocalizedDateTime(attempt.startedAt, locale)}</span>
                            <span>{t("quizzes.latestScore", { score: formatScore(attempt.score) })}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
