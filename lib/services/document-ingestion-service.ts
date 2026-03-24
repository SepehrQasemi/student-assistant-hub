import { extractedDocumentRepository, fileRepository } from "@/lib/repositories";
import { chunkDocumentText } from "@/lib/services/document-chunker";
import { detectDocumentType } from "@/lib/services/document-file-type";
import { normalizeExtractedText } from "@/lib/services/document-normalizer";
import { extractTextFromPdf } from "@/lib/services/pdf-text-extractor";
import type { DocumentType, ExtractedDocument, ExtractionStatus, StoredFileRecord } from "@/types/entities";

async function extractTextForDocument(blob: Blob, documentType: DocumentType) {
  if (documentType === "plain_text" || documentType === "markdown") {
    return blob.text();
  }

  if (documentType === "pdf_text") {
    return extractTextFromPdf(await blob.arrayBuffer());
  }

  return "";
}

function resolveEmptyStatus(text: string): ExtractionStatus {
  return text.trim().length === 0 ? "empty" : "success";
}

export class DocumentIngestionService {
  async ingestFile(fileId: string) {
    const ensuredFile = await fileRepository.ensureFingerprint(fileId);
    const existing = await extractedDocumentRepository.findByFileAndFingerprint(fileId, ensuredFile.contentFingerprint);

    if (existing && existing.status !== "pending") {
      return existing;
    }

    const documentType = detectDocumentType(ensuredFile);
    const pendingRecord =
      existing ??
      (await extractedDocumentRepository.save({
        fileId: ensuredFile.id,
        sourceFingerprint: ensuredFile.contentFingerprint,
        sourceUpdatedAt: ensuredFile.contentUpdatedAt,
        documentType,
        status: "pending",
        rawText: "",
        normalizedText: "",
        characterCount: 0,
        chunkCount: 0,
        errorMessage: null,
      }));

    if (documentType === "unsupported") {
      return extractedDocumentRepository.save({
        ...pendingRecord,
        documentType,
        status: "unsupported",
        errorMessage: null,
      });
    }

    const blob = await fileRepository.getBlob(fileId);

    if (!blob) {
      return extractedDocumentRepository.save({
        ...pendingRecord,
        status: "failed",
        errorMessage: "missing_source_blob",
      });
    }

    try {
      const rawText = await extractTextForDocument(blob, documentType);
      const normalizedText = normalizeExtractedText(rawText);
      const chunkCount = normalizedText ? chunkDocumentText(normalizedText).length : 0;

      return extractedDocumentRepository.save({
        ...pendingRecord,
        documentType,
        status: resolveEmptyStatus(normalizedText),
        rawText,
        normalizedText,
        characterCount: normalizedText.trim().length,
        chunkCount,
        errorMessage: null,
      });
    } catch (error) {
      return extractedDocumentRepository.save({
        ...pendingRecord,
        documentType,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "unknown_extraction_error",
      });
    }
  }

  async getLatestForFile(fileId: string) {
    const file = await fileRepository.getById(fileId);

    if (!file) {
      return undefined;
    }

    const ensuredFile = await fileRepository.ensureFingerprint(fileId);
    return extractedDocumentRepository.findByFileAndFingerprint(fileId, ensuredFile.contentFingerprint);
  }

  isStale(file: Pick<StoredFileRecord, "contentFingerprint">, summary: Pick<ExtractedDocument, "sourceFingerprint">) {
    return file.contentFingerprint !== summary.sourceFingerprint;
  }
}

export const documentIngestionService = new DocumentIngestionService();
