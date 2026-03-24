import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { ExtractedDocument } from "@/types/entities";

export type ExtractedDocumentInput = Omit<ExtractedDocument, "id" | "createdAt" | "updatedAt"> & { id?: string };

export class ExtractedDocumentRepository {
  async listByFile(fileId: string) {
    const items = await db.extractedDocuments.where("fileId").equals(fileId).toArray();
    return items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async findByFileAndFingerprint(fileId: string, sourceFingerprint: string) {
    return db.extractedDocuments.where("[fileId+sourceFingerprint]").equals([fileId, sourceFingerprint]).last();
  }

  async save(input: ExtractedDocumentInput) {
    const timestamp = nowIso();

    if (input.id) {
      const existing = await db.extractedDocuments.get(input.id);

      if (!existing) {
        throw new Error(`Extracted document ${input.id} not found`);
      }

      const nextRecord: ExtractedDocument = {
        ...existing,
        ...input,
        updatedAt: timestamp,
      };

      await db.extractedDocuments.put(nextRecord);
      return nextRecord;
    }

    const record: ExtractedDocument = {
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.extractedDocuments.add(record);
    return record;
  }
}

export const extractedDocumentRepository = new ExtractedDocumentRepository();
