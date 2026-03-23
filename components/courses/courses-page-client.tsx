"use client";

import { useState } from "react";
import { BookOpenText, Pencil } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { courseRepository } from "@/lib/repositories";
import { useI18n } from "@/lib/providers/i18n-provider";
import type { Course } from "@/types/entities";

export function CoursesPageClient() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const courses = useLiveQuery(() => courseRepository.list(), [], undefined);

  function openCreate() {
    setEditingCourse(null);
    setOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("courses.title")}
        subtitle={t("courses.subtitle")}
        actions={<Button onClick={openCreate}>{t("courses.create")}</Button>}
      />

      {courses === undefined ? (
        <Card>
          <CardContent className="py-12 text-sm text-slate-600">{t("common.loading")}</CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <EmptyState
          title={t("courses.emptyTitle")}
          description={t("courses.emptyDescription")}
          action={<Button onClick={openCreate}>{t("courses.create")}</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="h-2 w-full" style={{ backgroundColor: course.color }} />
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpenText className="h-4 w-4 text-slate-500" />
                      <CardTitle>{course.name}</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {course.code ? <Badge variant="muted">{course.code}</Badge> : null}
                      {course.semester ? <Badge variant="accent">{course.semester}</Badge> : null}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(course)} aria-label={t("common.edit")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{course.instructor || t("courses.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">{course.notes || " "}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseFormDialog open={open} onOpenChange={setOpen} course={editingCourse} />
    </div>
  );
}
