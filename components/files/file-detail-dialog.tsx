"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import { useI18n } from "@/lib/providers/i18n-provider";
import { fileRepository, tagRepository } from "@/lib/repositories";
import { createFileMetadataSchema } from "@/lib/validation/file-metadata";
import { formatBytes } from "@/lib/utils";
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
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [textPreview, setTextPreview] = useState("");
  const schema = createFileMetadataSchema(t("validation.required"));
  type FileMetadataValues = z.infer<typeof schema>;

  const blob = useLiveQuery(() => (file ? fileRepository.getBlob(file.id) : Promise.resolve(undefined)), [file?.id], undefined);
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
      name: file?.name ?? "",
      courseId: file?.courseId ?? null,
      category: file?.category ?? "lecture_note",
      notes: file?.notes ?? "",
      tags: file?.tagIds.map((tagId) => tagLabelMap.get(tagId)).filter(Boolean).join(", ") ?? "",
    });
  }, [file, form, tagLabelMap]);

  useEffect(() => {
    if (!blob || file?.previewKind !== "text") {
      setTextPreview("");
      return;
    }

    void blob.text().then((text) => setTextPreview(text.slice(0, 4000)));
  }, [blob, file?.previewKind]);

  async function handleSave(values: FileMetadataValues) {
    if (!file) {
      return;
    }

    setIsSaving(true);

    try {
      const resolvedTags = await tagRepository.findOrCreateMany(values.tags.split(","));
      await fileRepository.updateMetadata(file.id, {
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
    if (!file) {
      return;
    }

    if (!window.confirm(t("common.delete"))) {
      return;
    }

    await fileRepository.remove(file.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,1000px)]">
        <DialogHeader>
          <DialogTitle>{t("files.fileDetails")}</DialogTitle>
          <DialogDescription>{file?.originalName}</DialogDescription>
        </DialogHeader>

        {!file ? null : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{t(`categories.${file.category}`)}</Badge>
                <Badge variant="muted">{file.mimeType}</Badge>
                <Badge variant="muted">{formatBytes(file.sizeBytes)}</Badge>
              </div>
              {file.previewKind === "pdf" && objectUrl ? (
                <iframe title={file.name} src={objectUrl} className="min-h-[440px] w-full rounded-[20px] border border-slate-200 bg-white" />
              ) : null}
              {file.previewKind === "image" && objectUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={objectUrl} alt={file.name} className="max-h-[480px] w-full rounded-[20px] border border-slate-200 object-contain bg-white" />
              ) : null}
              {file.previewKind === "text" ? (
                <pre className="max-h-[480px] overflow-auto rounded-[20px] border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  {textPreview}
                </pre>
              ) : null}
              {file.previewKind === "unsupported" ? (
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

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>{t("files.fileType")}: {file.mimeType}</p>
                <p>{t("files.importedOn")}: {new Date(file.importedAt).toLocaleString()}</p>
              </div>

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
        )}
      </DialogContent>
    </Dialog>
  );
}
