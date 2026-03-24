import userEvent from "@testing-library/user-event";
import { act, screen, waitFor } from "@testing-library/react";

import { FileQuizPanel } from "@/components/files/file-quiz-panel";
import { fileRepository, settingsRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

async function importSupportedFile() {
  const [file] = await fileRepository.importMany([
    {
      file: new File(
        [[
          "# Distributed Systems",
          "Distributed systems coordinate services across multiple machines.",
          "Distributed systems tolerate failures and network delays.",
          "",
          "# Replication",
          "Replication improves resilience and replication introduces consistency tradeoffs.",
          "",
          "# Consensus",
          "Consensus algorithms help distributed systems agree on a value.",
          "",
          "# Review",
          "Review replication, consensus, and consistency before the exam.",
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

  return file!;
}

describe("FileQuizPanel", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
    await settingsRepository.update({ language: "en" });
  });

  it("generates a quiz and renders it in history", async () => {
    const file = await importSupportedFile();

    renderWithProviders(<FileQuizPanel file={file} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Generate quiz" }));

    await waitFor(() => {
      expect(screen.getByText("Quiz history")).toBeInTheDocument();
      expect(screen.getAllByText("Current quiz").length).toBeGreaterThan(0);
      expect(screen.getByText("distributed-systems quiz")).toBeInTheDocument();
    });
  });

  it("shows an unsupported state for unsupported quiz sources", async () => {
    const [file] = await fileRepository.importMany([
      {
        file: new File([new Uint8Array([1, 2, 3])], "archive.zip", { type: "application/zip" }),
        category: "other",
        courseId: null,
        notes: "",
        tagIds: [],
      },
    ]);

    renderWithProviders(<FileQuizPanel file={file!} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Generate quiz" }));

    await waitFor(() => {
      expect(screen.getByText("This file type is not supported for local quiz generation.")).toBeInTheDocument();
    });
  });

  it("marks quizzes as stale after the source file changes", async () => {
    const file = await importSupportedFile();
    const { rerender } = renderWithProviders(<FileQuizPanel file={file} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Generate quiz" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Start quiz" })).toBeInTheDocument();
    });

    await act(async () => {
      await fileRepository.replaceSource(
        file.id,
        new File(["# Distributed Systems\nUpdated replication guidance for revision."], "distributed-systems.md", { type: "text/markdown" }),
      );

      const updatedFile = await fileRepository.getById(file.id);
      rerender(<FileQuizPanel file={updatedFile!} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText("Stale quiz").length).toBeGreaterThan(0);
    });
  });

  it("renders French Phase 3 UI copy when the locale changes", async () => {
    const file = await importSupportedFile();
    await settingsRepository.update({ language: "fr" });

    renderWithProviders(<FileQuizPanel file={file} />);

    await waitFor(() => {
      expect(screen.getByText("Quiz")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Générer un quiz" })).toBeInTheDocument();
    });
  });
});
