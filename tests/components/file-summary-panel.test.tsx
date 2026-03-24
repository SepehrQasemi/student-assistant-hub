import userEvent from "@testing-library/user-event";
import { act, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { FileSummaryPanel } from "@/components/files/file-summary-panel";
import { fileRepository, settingsRepository } from "@/lib/repositories";
import { documentSummaryService } from "@/lib/services/document-summary-service";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

async function importSupportedFile() {
  const [file] = await fileRepository.importMany([
    {
      file: new File(
        [
          "# Databases\nDatabases organize information for applications. Database design and normalization are important for exams and revision.",
        ],
        "databases.md",
        { type: "text/markdown" },
      ),
      category: "lecture_note",
      courseId: null,
      notes: "",
      tagIds: [],
    },
  ]);

  return file!;
}

describe("FileSummaryPanel", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await resetDb();
    await settingsRepository.ensure();
    await settingsRepository.update({ language: "en" });
  });

  it("generates a summary and renders history", async () => {
    const file = await importSupportedFile();

    renderWithProviders(<FileSummaryPanel file={file} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Quick summary" }));

    await waitFor(() => {
      expect(screen.getByText("Summary history")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });
  });

  it("shows an unsupported state for unsupported file types", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File([new Uint8Array([1, 2, 3])], "archive.zip", { type: "application/zip" }),
        category: "other",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    renderWithProviders(<FileSummaryPanel file={file!} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Quick summary" }));

    await waitFor(() => {
      expect(screen.getByText("This file format is not supported for local summarization in Phase 2.")).toBeInTheDocument();
    });
  });

  it("shows a loading state while a summary is generating", async () => {
    const file = await importSupportedFile();
    let resolvePromise: ((value: unknown) => void) | undefined;

    vi.spyOn(documentSummaryService, "generateForFile").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }) as ReturnType<typeof documentSummaryService.generateForFile>,
    );

    renderWithProviders(<FileSummaryPanel file={file} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Quick summary" }));

    expect(screen.getAllByText("Generating...").length).toBeGreaterThan(0);

    resolvePromise?.({
      status: "unsupported",
      extractedDocument: null,
      summary: null,
      sections: [],
      concepts: [],
    });

    await waitFor(() => {
      expect(screen.getByText("Summary history")).toBeInTheDocument();
    });
  });

  it("marks a stored summary as stale after the source file changes", async () => {
    const file = await importSupportedFile();
    const { rerender } = renderWithProviders(<FileSummaryPanel file={file} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Quick summary" }));

    await waitFor(() => {
      expect(screen.getByText("Current")).toBeInTheDocument();
    });

    await act(async () => {
      await fileRepository.replaceSource(
        file.id,
        new File(["Updated content about distributed systems and consistency."], "databases.md", { type: "text/markdown" }),
      );

      const updatedFile = await fileRepository.getById(file.id);
      rerender(<FileSummaryPanel file={updatedFile!} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText("Stale").length).toBeGreaterThan(0);
    });
  });

  it("renders Phase 2 UI copy in French when the locale changes", async () => {
    const file = await importSupportedFile();
    await settingsRepository.update({ language: "fr" });

    renderWithProviders(<FileSummaryPanel file={file} />);

    await waitFor(() => {
      expect(screen.getByText("Résumés")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Résumé rapide" })).toBeInTheDocument();
    });
  });
});
