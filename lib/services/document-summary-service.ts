import { extractedDocumentRepository, fileRepository, summaryRepository } from "@/lib/repositories";
import { documentIngestionService } from "@/lib/services/document-ingestion-service";
import { generateLocalSummary } from "@/lib/services/local-summarizer";
import { isFingerprintStale } from "@/lib/services/summary-staleness";
import type { SummaryMode } from "@/types/entities";

export class DocumentSummaryService {
  async generateForFile(fileId: string, mode: SummaryMode) {
    const file = await fileRepository.getById(fileId);

    if (!file) {
      throw new Error("missing_source_file");
    }

    const extractedDocument = await documentIngestionService.ingestFile(fileId);

    if (extractedDocument.status !== "success" || !extractedDocument.normalizedText) {
      return {
        status: extractedDocument.status,
        extractedDocument,
        summary: null,
        sections: [],
        concepts: [],
      } as const;
    }

    const latestExisting = (await summaryRepository.listByFileAndMode(fileId, mode)).find(
      (summary) => summary.sourceFingerprint === extractedDocument.sourceFingerprint,
    );

    if (latestExisting) {
      const [sections, concepts] = await Promise.all([
        summaryRepository.getSections(latestExisting.id),
        summaryRepository.getConcepts(latestExisting.id),
      ]);

      return {
        status: "success",
        extractedDocument,
        summary: latestExisting,
        sections,
        concepts,
      } as const;
    }

    const generated = generateLocalSummary(extractedDocument.normalizedText, mode);
    const created = await summaryRepository.create({
      fileId,
      extractedDocumentId: extractedDocument.id,
      sourceFingerprint: extractedDocument.sourceFingerprint,
      mode,
      overview: generated.overview,
      sections: generated.sections,
      concepts: generated.concepts,
    });

    await extractedDocumentRepository.save({
      ...extractedDocument,
      chunkCount: generated.chunkCount,
    });

    return {
      status: "success",
      extractedDocument,
      summary: created.summary,
      sections: created.sections,
      concepts: created.concepts,
    } as const;
  }

  async getHistoryForFile(fileId: string) {
    const file = await fileRepository.getById(fileId);

    if (!file) {
      throw new Error("missing_source_file");
    }

    const summaries = await summaryRepository.listByFile(fileId);

    return summaries.map((summary) => ({
      ...summary,
      stale: isFingerprintStale(file.contentFingerprint, summary.sourceFingerprint),
    }));
  }

  async getSummaryView(summaryId: string) {
    const summary = await summaryRepository.getById(summaryId);

    if (!summary) {
      throw new Error("missing_summary");
    }

    const [file, sections, concepts] = await Promise.all([
      fileRepository.getById(summary.fileId),
      summaryRepository.getSections(summaryId),
      summaryRepository.getConcepts(summaryId),
    ]);

    return {
      summary,
      sections,
      concepts,
      stale: file ? isFingerprintStale(file.contentFingerprint, summary.sourceFingerprint) : false,
      missingSourceFile: !file,
    };
  }
}

export const documentSummaryService = new DocumentSummaryService();
