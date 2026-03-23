import { db } from "@/lib/db/app-db";
import { createId, getFileExtension, nowIso } from "@/lib/utils";
import type { FileCategory, FilePreviewKind, StoredFileRecord, FileBlobRecord } from "@/types/entities";

export interface FileImportInput {
  file: File;
  category: FileCategory;
  courseId: string | null;
  notes: string;
  tagIds: string[];
}

export interface FileMetadataUpdate {
  name: string;
  courseId: string | null;
  category: FileCategory;
  notes: string;
  tagIds: string[];
}

function resolvePreviewKind(mimeType: string, extension: string): FilePreviewKind {
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (
    mimeType.startsWith("text/") ||
    ["txt", "md", "json", "csv", "tsv", "log"].includes(extension.toLowerCase())
  ) {
    return "text";
  }

  return "unsupported";
}

export class FileRepository {
  async list() {
    const items = await db.files.toArray();
    return items
      .filter((item) => !item.deletedAt)
      .sort((left, right) => right.importedAt.localeCompare(left.importedAt));
  }

  async getById(id: string) {
    const item = await db.files.get(id);
    return item && !item.deletedAt ? item : undefined;
  }

  async importMany(inputs: FileImportInput[]) {
    const importedAt = nowIso();
    const preparedRecords = await Promise.all(
      inputs.map(async (input) => {
        const fileId = createId();
        const blobId = createId();
        const extension = getFileExtension(input.file.name);
        const previewKind = resolvePreviewKind(input.file.type, extension);

        const fileRecord: StoredFileRecord = {
          id: fileId,
          name: input.file.name.replace(/\.[^.]+$/, ""),
          originalName: input.file.name,
          courseId: input.courseId,
          category: input.category,
          mimeType: input.file.type || "application/octet-stream",
          extension,
          sizeBytes: input.file.size,
          notes: input.notes,
          tagIds: input.tagIds,
          blobId,
          importedAt,
          previewKind,
          createdAt: importedAt,
          updatedAt: importedAt,
          deletedAt: null,
        };

        const blobRecord: FileBlobRecord = {
          id: blobId,
          fileId,
          data: await input.file.arrayBuffer(),
          mimeType: input.file.type || "application/octet-stream",
          createdAt: importedAt,
          updatedAt: importedAt,
        };

        return { fileRecord, blobRecord };
      }),
    );

    const results = await db.transaction("rw", db.files, db.fileBlobs, async () => {
      const created: StoredFileRecord[] = [];

      for (const { fileRecord, blobRecord } of preparedRecords) {
        await db.files.add(fileRecord);
        await db.fileBlobs.add(blobRecord);
        created.push(fileRecord);
      }

      return created;
    });

    return results;
  }

  async getBlob(fileId: string) {
    const file = await this.getById(fileId);

    if (!file) {
      return undefined;
    }

    const blobRecord = await db.fileBlobs.where("fileId").equals(fileId).first();

    if (!blobRecord) {
      return undefined;
    }

    return new Blob([blobRecord.data], { type: blobRecord.mimeType });
  }

  async updateMetadata(id: string, update: FileMetadataUpdate) {
    const existing = await db.files.get(id);

    if (!existing) {
      throw new Error(`File ${id} not found`);
    }

    const nextFile: StoredFileRecord = {
      ...existing,
      ...update,
      updatedAt: nowIso(),
    };

    await db.files.put(nextFile);
    return nextFile;
  }

  async remove(id: string) {
    const existing = await db.files.get(id);

    if (!existing) {
      return;
    }

    await db.transaction("rw", db.files, db.fileBlobs, async () => {
      await db.files.put({
        ...existing,
        deletedAt: nowIso(),
        updatedAt: nowIso(),
      });

      await db.fileBlobs.delete(existing.blobId);
    });
  }
}

export const fileRepository = new FileRepository();
