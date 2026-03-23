import { fileRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("file repository", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("imports files, stores blobs, updates metadata, and removes files", async () => {
    const sampleFile = new File(["hello world"], "revision-note.txt", { type: "text/plain" });

    const imported = await fileRepository.importMany([
      {
        file: sampleFile,
        category: "lecture_note",
        courseId: null,
        notes: "first import",
        tagIds: [],
      },
    ]);

    expect(imported).toHaveLength(1);
    expect(imported[0]?.previewKind).toBe("text");

    const blob = await fileRepository.getBlob(imported[0]!.id);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.size).toBe(sampleFile.size);
    expect(blob?.type).toBe(sampleFile.type);

    const updated = await fileRepository.updateMetadata(imported[0]!.id, {
      name: "Revision note",
      courseId: "course-1",
      category: "personal",
      notes: "updated",
      tagIds: ["tag-1"],
    });

    expect(updated.name).toBe("Revision note");
    expect(updated.courseId).toBe("course-1");

    await fileRepository.remove(imported[0]!.id);

    const afterDelete = await fileRepository.list();
    expect(afterDelete).toHaveLength(0);
  });
});
