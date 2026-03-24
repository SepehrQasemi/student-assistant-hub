import { documentSummaryService } from "@/lib/services/document-summary-service";
import { quizSourceService } from "@/lib/services/quiz-source-service";
import { fileRepository, settingsRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("quizSourceService", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("builds source material from extracted text and current summary artifacts", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File(
          [[
            "# Distributed Systems",
            "Distributed systems coordinate services across multiple machines.",
            "",
            "# Replication",
            "Replication improves resilience and replication also introduces consistency tradeoffs before the exam.",
            "",
            "# Consensus",
            "Consensus algorithms help distributed systems agree on a value.",
          ].join("\n")],
          "distributed-systems.md",
          { type: "text/markdown" },
        ),
        category: "lecture_note",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    await documentSummaryService.generateForFile(file!.id, "structured_summary");
    const result = await quizSourceService.getSourceMaterial(file!.id);

    expect(result.extractedDocument.status).toBe("success");
    expect(result.source?.sections.length).toBeGreaterThanOrEqual(2);
    expect(result.source?.concepts.some((concept) => concept.term.includes("replication"))).toBe(true);
    expect(result.source?.summaryHints.length).toBeGreaterThan(0);
  });
});
