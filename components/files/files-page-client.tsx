"use client";

import { useMemo, useState } from "react";
import { FileSearch, Grid2X2, List, Search } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { FileDetailDialog } from "@/components/files/file-detail-dialog";
import { FileImportDialog } from "@/components/files/file-import-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/providers/i18n-provider";
import { courseRepository, fileRepository, tagRepository } from "@/lib/repositories";
import { filterAndSortFiles } from "@/lib/services/file-query-service";
import { formatBytes } from "@/lib/utils";
import type { FileFilters, StoredFileRecord } from "@/types/entities";

const initialFilters: FileFilters = {
  search: "",
  courseId: "all",
  category: "all",
  fileType: "all",
  sort: "recent",
  viewMode: "grid",
};

export function FilesPageClient() {
  const { t } = useI18n();
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<StoredFileRecord | null>(null);
  const [filters, setFilters] = useState<FileFilters>(initialFilters);

  const files = useLiveQuery(() => fileRepository.list(), [], undefined);
  const courses = useLiveQuery(() => courseRepository.list(), [], []);
  const tags = useLiveQuery(() => tagRepository.list(), [], []);

  const visibleFiles = useMemo(() => (files ? filterAndSortFiles(files, filters) : []), [files, filters]);
  const fileTypes = useMemo(() => {
    const values = new Set((files ?? []).map((file) => file.extension || file.mimeType.split("/")[0]).filter(Boolean));
    return Array.from(values).sort();
  }, [files]);
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const tagMap = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
  const recentFiles = useMemo(() => (files ?? []).slice(0, 4), [files]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("files.title")}
        subtitle={t("files.subtitle")}
        actions={<Button onClick={() => setImportOpen(true)}>{t("files.import")}</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("common.filters")}</CardTitle>
            <CardDescription>{t("files.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2 xl:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder={t("common.search")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Select value={filters.courseId} onValueChange={(value) => setFilters((current) => ({ ...current, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("files.filterByCourse")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value as FileFilters["category"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("files.filterByCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {["lecture_note", "slide", "assignment", "exam_material", "personal", "other"].map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={filters.fileType} onValueChange={(value) => setFilters((current) => ({ ...current, fileType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("files.filterByType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {fileTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={filters.sort} onValueChange={(value) => setFilters((current) => ({ ...current, sort: value as FileFilters["sort"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("files.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("filters.sortRecent")}</SelectItem>
                  <SelectItem value="name">{t("filters.sortName")}</SelectItem>
                  <SelectItem value="size">{t("filters.sortSize")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 md:col-span-2 xl:col-span-5">
              <Button variant={filters.viewMode === "grid" ? "default" : "secondary"} size="sm" onClick={() => setFilters((current) => ({ ...current, viewMode: "grid" }))}>
                <Grid2X2 className="h-4 w-4" />
                {t("files.gridView")}
              </Button>
              <Button variant={filters.viewMode === "list" ? "default" : "secondary"} size="sm" onClick={() => setFilters((current) => ({ ...current, viewMode: "list" }))}>
                <List className="h-4 w-4" />
                {t("files.listView")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setFilters(initialFilters)}>
                {t("common.clearFilters")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentFiles")}</CardTitle>
            <CardDescription>{t("files.importedOn")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFiles.length === 0 ? (
              <p className="text-sm text-slate-600">{t("files.emptyDescription")}</p>
            ) : (
              recentFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3 text-left transition hover:border-teal-200 hover:bg-teal-50/50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{new Date(file.importedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="muted">{formatBytes(file.sizeBytes)}</Badge>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {files === undefined ? (
        <Card>
          <CardContent className="py-12 text-sm text-slate-600">{t("common.loading")}</CardContent>
        </Card>
      ) : visibleFiles.length === 0 ? (
        <EmptyState
          title={files.length === 0 ? t("files.emptyTitle") : t("common.noResults")}
          description={files.length === 0 ? t("files.emptyDescription") : t("common.clearFilters")}
          action={<Button onClick={() => setImportOpen(true)}>{t("files.import")}</Button>}
        />
      ) : filters.viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleFiles.map((file) => (
            <button key={file.id} type="button" onClick={() => setSelectedFile(file)} className="text-left">
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileSearch className="h-4 w-4 text-slate-500" />
                        <CardTitle className="line-clamp-1">{file.name}</CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="accent">{t(`categories.${file.category}`)}</Badge>
                        <Badge variant="muted">{file.extension || file.mimeType}</Badge>
                      </div>
                    </div>
                    {file.courseId && courseMap.get(file.courseId) ? (
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: courseMap.get(file.courseId)?.color }} />
                    ) : null}
                  </div>
                  <CardDescription>{courseMap.get(file.courseId ?? "")?.name ?? t("common.noCourse")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-3 text-sm text-slate-600">{file.notes || t("files.fileDetails")}</p>
                  <div className="flex flex-wrap gap-2">
                    {file.tagIds.map((tagId) => {
                      const tag = tagMap.get(tagId);
                      return tag ? <Badge key={tag.id}>{tag.label}</Badge> : null;
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatBytes(file.sizeBytes)}</span>
                    <span>{new Date(file.importedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y divide-slate-200 p-0">
            {visibleFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedFile(file)}
                className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <Badge variant="accent">{t(`categories.${file.category}`)}</Badge>
                    <Badge variant="muted">{file.extension || file.mimeType}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{courseMap.get(file.courseId ?? "")?.name ?? t("common.noCourse")}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{formatBytes(file.sizeBytes)}</span>
                  <span>{new Date(file.importedAt).toLocaleString()}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <FileImportDialog open={importOpen} onOpenChange={setImportOpen} courses={courses} />
      <FileDetailDialog file={selectedFile} courses={courses} tags={tags} open={Boolean(selectedFile)} onOpenChange={(open) => !open && setSelectedFile(null)} />
    </div>
  );
}
