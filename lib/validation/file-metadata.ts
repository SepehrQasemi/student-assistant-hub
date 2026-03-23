import { z } from "zod";

export function createFileMetadataSchema(requiredMessage: string) {
  return z.object({
    name: z.string().trim().min(1, requiredMessage),
    courseId: z.string().nullable(),
    category: z.enum(["lecture_note", "slide", "assignment", "exam_material", "personal", "other"]),
    notes: z.string().trim().max(2000),
    tags: z.string().trim(),
  });
}

export function createFileImportSchema() {
  return z.object({
    courseId: z.string().nullable(),
    category: z.enum(["lecture_note", "slide", "assignment", "exam_material", "personal", "other"]),
    notes: z.string().trim().max(1000),
  });
}
