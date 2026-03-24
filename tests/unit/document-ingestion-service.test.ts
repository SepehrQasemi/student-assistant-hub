import { extractedDocumentRepository, fileRepository } from "@/lib/repositories";
import { documentIngestionService } from "@/lib/services/document-ingestion-service";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("document ingestion service", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("extracts plain text and persists a successful extracted document", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File(["Line one\n\nLine two"], "notes.txt", { type: "text/plain" }),
        category: "lecture_note",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    const extracted = await documentIngestionService.ingestFile(file!.id);
    const stored = await extractedDocumentRepository.findByFileAndFingerprint(file!.id, file!.contentFingerprint);

    expect(extracted.status).toBe("success");
    expect(extracted.documentType).toBe("plain_text");
    expect(extracted.rawText).toContain("Line one");
    expect(stored?.normalizedText).toContain("Line two");
  });

  it("persists an unsupported status for unsupported file types", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File([new Uint8Array([1, 2, 3])], "archive.zip", { type: "application/zip" }),
        category: "other",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    const extracted = await documentIngestionService.ingestFile(file!.id);

    expect(extracted.status).toBe("unsupported");
    expect(extracted.documentType).toBe("unsupported");
    expect(extracted.normalizedText).toBe("");
  });
});
