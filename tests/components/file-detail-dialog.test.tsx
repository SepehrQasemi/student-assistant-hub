import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { FileDetailDialog } from "@/components/files/file-detail-dialog";
import { courseRepository, fileRepository, settingsRepository, tagRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("FileDetailDialog", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await resetDb();
    await settingsRepository.ensure();
  });

  it("renders file details, tabs, and replaces the source file", async () => {
    const course = await courseRepository.save({
      name: "Distributed Systems",
      code: "MIAGE-DS",
      instructor: "Dr Martin",
      semester: "Spring 2026",
      color: "#2563eb",
      notes: "",
    });
    const [tag] = await tagRepository.findOrCreateMany(["revision"]);
    const [file] = await fileRepository.importMany([
      {
        file: new File(["Replication supports resilience."], "systems.txt", { type: "text/plain" }),
        category: "lecture_note",
        courseId: course.id,
        notes: "Revision note",
        tagIds: [tag!.id],
      },
    ]);

    renderWithProviders(
      <FileDetailDialog
        file={file!}
        courses={[course]}
        tags={[tag!]}
        open
        onOpenChange={() => undefined}
      />,
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByDisplayValue("systems")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: "Summaries" }));
    await waitFor(() => {
      expect(screen.getByText("Summary history")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: "Quizzes" }));
    await waitFor(() => {
      expect(screen.getByText("Quiz history")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: "Details" }));
    const dialog = screen.getByRole("dialog");
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement | null;

    expect(fileInput).not.toBeNull();
    await user.upload(fileInput!, new File(["Updated revision content"], "systems-updated.txt", { type: "text/plain" }));
    await user.click(screen.getByRole("button", { name: "Replace source file" }));

    await waitFor(async () => {
      expect((await fileRepository.getById(file!.id))?.originalName).toBe("systems-updated.txt");
    });
  }, 15_000);
});
