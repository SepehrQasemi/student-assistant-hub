import type { FileFilters, StoredFileRecord } from "@/types/entities";

export function matchesFileType(file: StoredFileRecord, fileType: string) {
  if (fileType === "all") {
    return true;
  }

  return file.mimeType.toLowerCase().includes(fileType.toLowerCase()) || file.extension === fileType.toLowerCase();
}

export function filterAndSortFiles(files: StoredFileRecord[], filters: FileFilters) {
  const query = filters.search.trim().toLowerCase();

  const filtered = files.filter((file) => {
    const matchesSearch =
      !query ||
      file.name.toLowerCase().includes(query) ||
      file.originalName.toLowerCase().includes(query) ||
      file.notes.toLowerCase().includes(query);

    const matchesCourse = filters.courseId === "all" || file.courseId === filters.courseId;
    const matchesCategory = filters.category === "all" || file.category === filters.category;
    const matchesType = matchesFileType(file, filters.fileType);

    return matchesSearch && matchesCourse && matchesCategory && matchesType;
  });

  return filtered.sort((left, right) => {
    switch (filters.sort) {
      case "name":
        return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
      case "size":
        return right.sizeBytes - left.sizeBytes;
      case "recent":
      default:
        return right.importedAt.localeCompare(left.importedAt);
    }
  });
}
