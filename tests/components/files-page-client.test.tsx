import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { FilesPageClient } from "@/components/files/files-page-client";
import { courseRepository, fileRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("FilesPageClient", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("filters files through the search input", async () => {
    const course = await courseRepository.save({
      name: "Math",
      code: "MTH",
      instructor: "Prof. B",
      semester: "Spring 2026",
      color: "#1d4ed8",
      notes: "",
    });

    await fileRepository.importMany([
      {
        file: new File(["linear algebra"], "algebra.txt", { type: "text/plain" }),
        category: "lecture_note",
        courseId: course.id,
        notes: "",
        tagIds: [],
      },
      {
        file: new File(["probability"], "stats.txt", { type: "text/plain" }),
        category: "slide",
        courseId: course.id,
        notes: "",
        tagIds: [],
      },
    ]);

    renderWithProviders(<FilesPageClient />);

    await waitFor(() => {
      expect(screen.getAllByText("algebra")).toHaveLength(2);
      expect(screen.getAllByText("stats")).toHaveLength(2);
    });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Search"), "stats");

    await waitFor(() => {
      expect(screen.getAllByText("stats")).toHaveLength(2);
      expect(screen.getAllByText("algebra")).toHaveLength(1);
    });
  });
});
