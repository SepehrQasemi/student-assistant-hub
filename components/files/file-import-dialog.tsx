"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { fileRepository } from "@/lib/repositories";
import { useI18n } from "@/lib/providers/i18n-provider";
import { createFileImportSchema } from "@/lib/validation/file-metadata";
import type { Course } from "@/types/entities";

export function FileImportDialog({
  open,
  onOpenChange,
  courses,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
}) {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const schema = createFileImportSchema();
  type FileImportValues = z.infer<typeof schema>;

  const form = useForm<FileImportValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseId: null,
      category: "lecture_note",
      notes: "",
    },
  });

  async function handleImport(values: FileImportValues) {
    if (files.length === 0) {
      return;
    }

    setIsImporting(true);

    try {
      await fileRepository.importMany(
        files.map((file) => ({
          file,
          courseId: values.courseId,
          category: values.category,
          notes: values.notes,
          tagIds: [],
        })),
      );

      setFiles([]);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("files.import")}</DialogTitle>
          <DialogDescription>{t("files.subtitle")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleImport)}>
          <div className="space-y-2">
            <Label htmlFor="file-import-input">{t("files.import")}</Label>
            <Input
              id="file-import-input"
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <p className="text-xs text-slate-500">
              {files.length === 0 ? t("files.emptyDescription") : t("files.selectedCount", { count: files.length })}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("files.filterByCourse")}</Label>
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
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as FileImportValues["category"])}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-notes">{t("common.notes")}</Label>
            <Textarea id="import-notes" {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isImporting || files.length === 0}>
              {isImporting ? `${t("common.loading")} ${files.length}` : t("files.import")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
