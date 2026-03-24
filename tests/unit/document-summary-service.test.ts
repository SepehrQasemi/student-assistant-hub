import { fileRepository } from "@/lib/repositories";
import { documentSummaryService } from "@/lib/services/document-summary-service";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("document summary service", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates and reuses a stored summary for the same file fingerprint", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File(
          [
            "# Algorithms\nAlgorithms solve problems efficiently. Algorithms analysis studies time complexity and space complexity.",
          ],
          "algorithms.md",
          { type: "text/markdown" },
        ),
        category: "lecture_note",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    const first = await documentSummaryService.generateForFile(file!.id, "structured_summary");
    const second = await documentSummaryService.generateForFile(file!.id, "structured_summary");
    const history = await documentSummaryService.getHistoryForFile(file!.id);

    expect(first.status).toBe("success");
    expect(first.summary?.id).toBe(second.summary?.id);
    expect(history).toHaveLength(1);
    expect(first.sections.length).toBeGreaterThan(0);
    expect(first.concepts.length).toBeGreaterThan(0);
  });

  it("marks old summaries as stale after the file source changes", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File(["Original text about operating systems and scheduling."], "systems.txt", { type: "text/plain" }),
        category: "lecture_note",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    const first = await documentSummaryService.generateForFile(file!.id, "quick_summary");
    await fileRepository.replaceSource(file!.id, new File(["Updated content about distributed systems."], "systems.txt", { type: "text/plain" }));

    const history = await documentSummaryService.getHistoryForFile(file!.id);

    expect(first.summary).not.toBeNull();
    expect(history[0]?.stale).toBe(true);
  });

  it("returns unsupported instead of creating a fake summary", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File([new Uint8Array([1, 2, 3])], "archive.zip", { type: "application/zip" }),
        category: "other",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    const result = await documentSummaryService.generateForFile(file!.id, "quick_summary");

    expect(result.status).toBe("unsupported");
    expect(result.summary).toBeNull();
  });
});
