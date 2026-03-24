"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FileSummaryPanel } from "@/components/files/file-summary-panel";
import { FileQuizPanel } from "@/components/files/file-quiz-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import { useI18n } from "@/lib/providers/i18n-provider";
import { fileRepository, tagRepository } from "@/lib/repositories";
import { createFileMetadataSchema } from "@/lib/validation/file-metadata";
import { formatBytes, formatLocalizedDateTime } from "@/lib/utils";
import type { Course, FileTag, StoredFileRecord } from "@/types/entities";

export function FileDetailDialog({
  file,
  courses,
  tags,
  open,
  onOpenChange,
}: {
  file: StoredFileRecord | null;
  courses: Course[];
  tags: FileTag[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacingSource, setIsReplacingSource] = useState(false);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [textPreview, setTextPreview] = useState("");
  const schema = createFileMetadataSchema(t("validation.required"));
  type FileMetadataValues = z.infer<typeof schema>;

  const liveFile = useLiveQuery(() => (file ? fileRepository.getById(file.id) : Promise.resolve(undefined)), [file?.id], file ?? undefined);
  const effectiveFile = liveFile ?? file;
  const blob = useLiveQuery(() => (effectiveFile ? fileRepository.getBlob(effectiveFile.id) : Promise.resolve(undefined)), [effectiveFile?.id, effectiveFile?.updatedAt], undefined);
  const objectUrl = useObjectUrl(blob);

  const form = useForm<FileMetadataValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      courseId: null,
      category: "lecture_note",
      notes: "",
      tags: "",
    },
  });

  const tagLabelMap = useMemo(() => new Map(tags.map((tag) => [tag.id, tag.label])), [tags]);

  useEffect(() => {
    form.reset({
      name: effectiveFile?.name ?? "",
      courseId: effectiveFile?.courseId ?? null,
      category: effectiveFile?.category ?? "lecture_note",
      notes: effectiveFile?.notes ?? "",
      tags: effectiveFile?.tagIds.map((tagId) => tagLabelMap.get(tagId)).filter(Boolean).join(", ") ?? "",
    });
  }, [effectiveFile, form, tagLabelMap]);

  useEffect(() => {
    if (!blob || effectiveFile?.previewKind !== "text") {
      setTextPreview("");
      return;
    }

    void blob.text().then((text) => setTextPreview(text.slice(0, 4000)));
  }, [blob, effectiveFile?.previewKind]);

  async function handleSave(values: FileMetadataValues) {
    if (!effectiveFile) {
      return;
    }

    setIsSaving(true);

    try {
      const resolvedTags = await tagRepository.findOrCreateMany(values.tags.split(","));
      await fileRepository.updateMetadata(effectiveFile.id, {
        name: values.name,
        courseId: values.courseId,
        category: values.category,
        notes: values.notes,
        tagIds: resolvedTags.map((tag) => tag.id),
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!effectiveFile) {
      return;
    }

    if (!window.confirm(t("common.delete"))) {
      return;
    }

    await fileRepository.remove(effectiveFile.id);
    onOpenChange(false);
  }

  async function handleReplaceSource() {
    if (!effectiveFile || !replacementFile) {
      return;
    }

    setIsReplacingSource(true);

    try {
      await fileRepository.replaceSource(effectiveFile.id, replacementFile);
      setReplacementFile(null);
    } finally {
      setIsReplacingSource(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,1100px)] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t("files.fileDetails")}</DialogTitle>
          <DialogDescription>{effectiveFile?.originalName}</DialogDescription>
        </DialogHeader>

        {!effectiveFile ? null : (
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">{t("common.details")}</TabsTrigger>
              <TabsTrigger value="summaries">{t("summaries.title")}</TabsTrigger>
              <TabsTrigger value="quizzes">{t("quizzes.title")}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{t(`categories.${effectiveFile.category}`)}</Badge>
                    <Badge variant="muted">{effectiveFile.mimeType}</Badge>
                    <Badge variant="muted">{formatBytes(effectiveFile.sizeBytes)}</Badge>
                  </div>
                  {effectiveFile.previewKind === "pdf" && objectUrl ? (
                    <iframe title={effectiveFile.name} src={objectUrl} className="min-h-[320px] w-full rounded-[20px] border border-slate-200 bg-white md:min-h-[440px]" />
                  ) : null}
                  {effectiveFile.previewKind === "image" && objectUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={objectUrl} alt={effectiveFile.name} className="max-h-[320px] w-full rounded-[20px] border border-slate-200 bg-white object-contain md:max-h-[480px]" />
                  ) : null}
                  {effectiveFile.previewKind === "text" ? (
                    <pre className="max-h-[320px] overflow-auto rounded-[20px] border border-slate-200 bg-white p-4 text-sm text-slate-700 md:max-h-[480px]">
                      {textPreview}
                    </pre>
                  ) : null}
                  {effectiveFile.previewKind === "unsupported" ? (
                    <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                      <p>{t("files.unsupportedDescription")}</p>
                      <p className="mt-2">{t("common.unsupportedPreview")}</p>
                    </div>
                  ) : null}
                </div>

                <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
                  <div className="space-y-2">
                    <Label htmlFor="file-name">{t("common.name")}</Label>
                    <Input id="file-name" {...form.register("name")} />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("files.assignCourse")}</Label>
                    <Select
                      value={form.watch("courseId") ?? "none"}
                      onValueChange={(value) => form.setValue("courseId", value === "none" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("common.all")}</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("files.filterByCategory")}</Label>
                    <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as FileMetadataValues["category"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["lecture_note", "slide", "assignment", "exam_material", "personal", "other"].map((category) => (
                          <SelectItem key={category} value={category}>
                            {t(`categories.${category}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-tags">{t("common.tags")}</Label>
                    <Input id="file-tags" {...form.register("tags")} placeholder={t("files.tagPlaceholder")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-notes">{t("files.fileNotes")}</Label>
                    <Textarea id="file-notes" {...form.register("notes")} />
                  </div>

                  <Card>
                    <CardContent className="space-y-3 p-4">
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>{t("files.fileType")}: {effectiveFile.mimeType}</p>
                        <p>{t("files.importedOn")}: {formatLocalizedDateTime(effectiveFile.importedAt, locale)}</p>
                        <p>{t("summaries.lastSourceChange")}: {formatLocalizedDateTime(effectiveFile.contentUpdatedAt, locale)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t("summaries.replaceSource")}</p>
                        <p className="mt-1 text-sm text-slate-600">{t("summaries.replaceSourceDescription")}</p>
                      </div>
                      <Input type="file" onChange={(event) => setReplacementFile(event.target.files?.[0] ?? null)} />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="secondary" onClick={() => void handleReplaceSource()} disabled={!replacementFile || isReplacingSource}>
                          {isReplacingSource ? t("common.loading") : t("summaries.replaceSource")}
                        </Button>
                        {replacementFile ? <Badge variant="muted">{replacementFile.name}</Badge> : null}
                      </div>
                    </CardContent>
                  </Card>

                  <DialogFooter>
                    <Button type="button" variant="danger" onClick={() => void handleDelete()}>
                      {t("common.delete")}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                      {t("common.close")}
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? t("common.loading") : t("common.save")}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="summaries">
              <FileSummaryPanel file={effectiveFile} />
            </TabsContent>

            <TabsContent value="quizzes">
              <FileQuizPanel file={effectiveFile} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
