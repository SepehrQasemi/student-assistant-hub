import { detectDocumentType, isSupportedDocumentType } from "@/lib/services/document-file-type";

describe("document file type detection", () => {
  it("detects plain text, markdown, pdf, and unsupported files", () => {
    expect(detectDocumentType({ mimeType: "text/plain", extension: "txt" })).toBe("plain_text");
    expect(detectDocumentType({ mimeType: "text/markdown", extension: "md" })).toBe("markdown");
    expect(detectDocumentType({ mimeType: "application/pdf", extension: "pdf" })).toBe("pdf_text");
    expect(detectDocumentType({ mimeType: "application/zip", extension: "zip" })).toBe("unsupported");
  });

  it("treats only the unsupported type as unsupported", () => {
    expect(isSupportedDocumentType("plain_text")).toBe(true);
    expect(isSupportedDocumentType("markdown")).toBe(true);
    expect(isSupportedDocumentType("pdf_text")).toBe(true);
    expect(isSupportedDocumentType("unsupported")).toBe(false);
  });
});
