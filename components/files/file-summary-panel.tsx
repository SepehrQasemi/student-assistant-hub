"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extractedDocumentRepository } from "@/lib/repositories";
import { useI18n } from "@/lib/providers/i18n-provider";
import { detectDocumentType } from "@/lib/services/document-file-type";
import { documentSummaryService } from "@/lib/services/document-summary-service";
import type { StoredFileRecord, SummaryMode } from "@/types/entities";

const summaryModes: SummaryMode[] = ["quick_summary", "structured_summary", "study_notes", "key_concepts"];
type SummaryView = Awaited<ReturnType<typeof documentSummaryService.getSummaryView>>;

function extractionStatusVariant(status?: string) {
  if (status === "failed" || status === "unsupported" || status === "empty") {
    return "danger" as const;
  }

  if (status === "success") {
    return "accent" as const;
  }

  return "muted" as const;
}

function splitBulletText(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export function FileSummaryPanel({ file }: { file: StoredFileRecord }) {
  const { t } = useI18n();
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [generatingMode, setGeneratingMode] = useState<SummaryMode | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [summaryView, setSummaryView] = useState<SummaryView | undefined>(undefined);

  const history = useLiveQuery(() => documentSummaryService.getHistoryForFile(file.id), [file.id, file.contentFingerprint], []);
  const currentExtraction = useLiveQuery(
    () => extractedDocumentRepository.findByFileAndFingerprint(file.id, file.contentFingerprint),
    [file.id, file.contentFingerprint],
    undefined,
  );

  const detectedDocumentType = useMemo(() => detectDocumentType(file), [file]);

  useEffect(() => {
    if (history.length === 0) {
      setSelectedSummaryId(null);
      return;
    }

    if (!selectedSummaryId || !history.some((item) => item.id === selectedSummaryId)) {
      setSelectedSummaryId(history[0]!.id);
    }
  }, [history, selectedSummaryId]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedSummaryId) {
      setSummaryView(undefined);
      return () => {
        cancelled = true;
      };
    }

    void documentSummaryService
      .getSummaryView(selectedSummaryId)
      .then((result) => {
        if (!cancelled) {
          setSummaryView(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummaryView(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSummaryId, file.contentFingerprint, history]);

  async function handleGenerate(mode: SummaryMode) {
    setGeneratingMode(mode);
    setGenerationError(null);

    try {
      const result = await documentSummaryService.generateForFile(file.id, mode);

      if (result.status === "success" && result.summary) {
        setSelectedSummaryId(result.summary.id);
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "unknown_summary_error");
    } finally {
      setGeneratingMode(null);
    }
  }

  function renderExtractionMessage() {
    if (generationError) {
      return t("summaries.errors.summaryGenerationFailed");
    }

    if (generatingMode) {
      return t("summaries.generating");
    }

    if (!currentExtraction) {
      return detectedDocumentType === "unsupported"
        ? t("summaries.unsupportedDescription")
        : t("summaries.readyDescription");
    }

    if (currentExtraction.status === "success") {
      return t("summaries.extraction.successDescription", {
        chars: currentExtraction.characterCount,
        chunks: currentExtraction.chunkCount,
      });
    }

    if (currentExtraction.status === "unsupported") {
      return t("summaries.unsupportedDescription");
    }

    if (currentExtraction.status === "empty") {
      return t("summaries.emptyDescription");
    }

    if (currentExtraction.status === "failed") {
      return t("summaries.errors.extractionFailed");
    }

    return t("summaries.generating");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("summaries.title")}</CardTitle>
          <CardDescription>{t("summaries.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={extractionStatusVariant(currentExtraction?.status)}>
              {currentExtraction ? t(`summaries.extraction.${currentExtraction.status}`) : t(`summaries.documentTypes.${detectedDocumentType}`)}
            </Badge>
            {currentExtraction?.status === "success" ? <Badge variant="muted">{t(`summaries.documentTypes.${currentExtraction.documentType}`)}</Badge> : null}
            {selectedSummaryId && summaryView?.stale ? <Badge variant="danger">{t("summaries.staleBadge")}</Badge> : null}
          </div>
          <p className="text-sm text-slate-600">{renderExtractionMessage()}</p>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {summaryModes.map((mode) => (
              <Button
                key={mode}
                variant={selectedSummaryId && summaryView?.summary.mode === mode ? "default" : "secondary"}
                onClick={() => void handleGenerate(mode)}
                disabled={Boolean(generatingMode)}
              >
                {generatingMode === mode ? t("summaries.generating") : t(`summaries.modes.${mode}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("summaries.historyTitle")}</CardTitle>
            <CardDescription>{t("summaries.historyDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-slate-600">{t("summaries.historyEmpty")}</p>
            ) : (
              history.map((summary) => (
                <button
                  key={summary.id}
                  type="button"
                  onClick={() => setSelectedSummaryId(summary.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedSummaryId === summary.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/60"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{t(`summaries.modes.${summary.mode}`)}</p>
                    {summary.stale ? <Badge variant="danger">{t("summaries.staleBadge")}</Badge> : <Badge variant="accent">{t("summaries.currentBadge")}</Badge>}
                  </div>
                  <p className={`mt-2 text-xs ${selectedSummaryId === summary.id ? "text-slate-200" : "text-slate-500"}`}>
                    {new Date(summary.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("summaries.viewerTitle")}</CardTitle>
            <CardDescription>{t("summaries.viewerDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSummaryId || !summaryView ? (
              <p className="text-sm text-slate-600">{t("summaries.viewerEmpty")}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{t(`summaries.modes.${summaryView.summary.mode}`)}</Badge>
                  {summaryView.stale ? <Badge variant="danger">{t("summaries.staleWarning")}</Badge> : null}
                  {summaryView.missingSourceFile ? <Badge variant="danger">{t("summaries.errors.missingSource")}</Badge> : null}
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{t("summaries.sections.overview")}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{summaryView.summary.overview || t("summaries.viewerEmpty")}</p>
                </div>

                {summaryView.sections.filter((section) => section.sectionKey !== "overview").map((section) => {
                  const lines = splitBulletText(section.content);

                  return (
                    <div key={section.id} className="rounded-[22px] border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-900">{t(`summaries.sections.${section.sectionKey}`)}</p>
                      {lines.length > 1 || section.content.includes("- ") ? (
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                          {lines.map((line) => (
                            <li key={line} className="list-inside list-disc">
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{section.content}</p>
                      )}
                    </div>
                  );
                })}

                {summaryView.concepts.length > 0 ? (
                  <div className="space-y-3 rounded-[22px] border border-slate-200 p-4">
                    <p className="text-sm font-medium text-slate-900">{t("summaries.conceptsTitle")}</p>
                    <div className="flex flex-wrap gap-2">
                      {summaryView.concepts.map((concept) => (
                        <Badge key={concept.id} variant="muted">
                          {concept.term} ({concept.occurrences})
                        </Badge>
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
