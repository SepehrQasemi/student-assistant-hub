import { filterAndSortFiles, matchesFileType } from "@/lib/services/file-query-service";
import type { FileFilters, StoredFileRecord } from "@/types/entities";

const baseFilters: FileFilters = {
  search: "",
  courseId: "all",
  category: "all",
  fileType: "all",
  sort: "recent",
  viewMode: "grid",
};

const files: StoredFileRecord[] = [
  {
    id: "1",
    name: "Algorithms Notes",
    originalName: "algorithms.pdf",
    courseId: "course-a",
    category: "lecture_note",
    mimeType: "application/pdf",
    extension: "pdf",
    sizeBytes: 2_000,
    notes: "graph theory",
    tagIds: [],
    blobId: "blob-1",
    importedAt: "2026-03-20T10:00:00.000Z",
    previewKind: "pdf",
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "2",
    name: "Exam cheat sheet",
    originalName: "exam.txt",
    courseId: "course-b",
    category: "exam_material",
    mimeType: "text/plain",
    extension: "txt",
    sizeBytes: 600,
    notes: "revision priorities",
    tagIds: [],
    blobId: "blob-2",
    importedAt: "2026-03-22T10:00:00.000Z",
    previewKind: "text",
    createdAt: "2026-03-22T10:00:00.000Z",
    updatedAt: "2026-03-22T10:00:00.000Z",
    deletedAt: null,
  },
];

describe("file query service", () => {
  it("filters by search, course, and category", () => {
    const result = filterAndSortFiles(files, {
      ...baseFilters,
      search: "exam",
      courseId: "course-b",
      category: "exam_material",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });

  it("sorts by file size when requested", () => {
    const result = filterAndSortFiles(files, {
      ...baseFilters,
      sort: "size",
    });

    expect(result.map((file) => file.id)).toEqual(["1", "2"]);
  });

  it("matches file types from mime type or extension", () => {
    expect(matchesFileType(files[0], "pdf")).toBe(true);
    expect(matchesFileType(files[1], "text")).toBe(true);
    expect(matchesFileType(files[1], "png")).toBe(false);
  });
});
