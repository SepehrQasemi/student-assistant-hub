import type { DocumentType, StoredFileRecord } from "@/types/entities";

const markdownExtensions = new Set(["md", "markdown", "mdown", "mkd"]);
const plainTextExtensions = new Set(["txt", "text", "log", "csv", "tsv", "json", "xml", "yml", "yaml"]);

export function detectDocumentType(file: Pick<StoredFileRecord, "mimeType" | "extension">): DocumentType {
  const mimeType = file.mimeType.toLowerCase();
  const extension = file.extension.toLowerCase();

  if (mimeType === "application/pdf" || extension === "pdf") {
    return "pdf_text";
  }

  if (mimeType === "text/markdown" || markdownExtensions.has(extension)) {
    return "markdown";
  }

  if (mimeType.startsWith("text/") || plainTextExtensions.has(extension)) {
    return "plain_text";
  }

  return "unsupported";
}

export function isSupportedDocumentType(documentType: DocumentType) {
  return documentType !== "unsupported";
}
