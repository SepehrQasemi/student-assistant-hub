"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { courseRepository, eventRepository, fileRepository } from "@/lib/repositories";
import { useI18n } from "@/lib/providers/i18n-provider";
import { createCourseSchema } from "@/lib/validation/course";
import type { Course } from "@/types/entities";

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}) {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const schema = createCourseSchema(t("validation.required"));
  type CourseFormValues = z.infer<typeof schema>;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      instructor: "",
      semester: "",
      color: "#0f766e",
      notes: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: course?.name ?? "",
      code: course?.code ?? "",
      instructor: course?.instructor ?? "",
      semester: course?.semester ?? "",
      color: course?.color ?? "#0f766e",
      notes: course?.notes ?? "",
    });
  }, [course, form]);

  async function handleSubmit(values: CourseFormValues) {
    setIsSaving(true);

    try {
      await courseRepository.save(values, course?.id);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!course) {
      return;
    }

    if (!window.confirm(t("courses.deleteConfirm"))) {
      return;
    }

    setIsSaving(true);
    try {
      await courseRepository.remove(course.id);

      const [files, events] = await Promise.all([fileRepository.list(), eventRepository.list()]);
      await Promise.all(
        files
          .filter((file) => file.courseId === course.id)
          .map((file) =>
            fileRepository.updateMetadata(file.id, {
              name: file.name,
              courseId: null,
              category: file.category,
              notes: file.notes,
              tagIds: file.tagIds,
            }),
          ),
      );
      await Promise.all(
        events
          .filter((event) => event.courseId === course.id)
          .map((event) =>
            eventRepository.save(
              {
                title: event.title,
                description: event.description,
                type: event.type,
                courseId: null,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                allDay: event.allDay,
                location: event.location,
                status: event.status,
              },
              event.id,
            ),
          ),
      );
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? t("courses.edit") : t("courses.create")}</DialogTitle>
          <DialogDescription>{t("courses.subtitle")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-name">{t("courses.fields.name")}</Label>
              <Input id="course-name" {...form.register("name")} />
              {form.formState.errors.name ? <p className="text-xs text-red-600">{form.formState.errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">{t("courses.fields.code")}</Label>
              <Input id="course-code" {...form.register("code")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-instructor">{t("courses.fields.instructor")}</Label>
              <Input id="course-instructor" {...form.register("instructor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-semester">{t("courses.fields.semester")}</Label>
              <Input id="course-semester" {...form.register("semester")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-color">{t("courses.fields.color")}</Label>
            <Input id="course-color" type="color" className="h-14" {...form.register("color")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-notes">{t("courses.fields.notes")}</Label>
            <Textarea id="course-notes" {...form.register("notes")} />
          </div>

          <DialogFooter className="pt-2">
            {course ? (
              <Button type="button" variant="danger" onClick={() => void handleDelete()} disabled={isSaving} className="mr-auto">
                {t("common.delete")}
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
