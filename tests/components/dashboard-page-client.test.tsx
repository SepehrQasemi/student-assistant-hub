import { screen, waitFor } from "@testing-library/react";

import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { courseRepository, eventRepository, fileRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("DashboardPageClient", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("renders the empty state when the workspace has no data", async () => {
    renderWithProviders(<DashboardPageClient />);
    expect(await screen.findByText("Your workspace is ready")).toBeInTheDocument();
  });

  it("renders summary cards and recent files from local state", async () => {
    const course = await courseRepository.save({
      name: "Systems",
      code: "SYS",
      instructor: "Prof. A",
      semester: "Spring 2026",
      color: "#0f766e",
      notes: "",
    });

    await fileRepository.importMany([
      {
        file: new File(["content"], "systems.txt", { type: "text/plain" }),
        category: "lecture_note",
        courseId: course.id,
        notes: "Local note",
        tagIds: [],
      },
    ]);

    await eventRepository.save({
      title: "Systems exam",
      description: "",
      type: "exam",
      courseId: course.id,
      startsAt: "2030-04-01T09:00:00.000Z",
      endsAt: "2030-04-01T11:00:00.000Z",
      allDay: false,
      location: "",
      status: "scheduled",
    });

    renderWithProviders(<DashboardPageClient />);

    await waitFor(() => {
      expect(screen.getByText("Stored files")).toBeInTheDocument();
      expect(screen.getByText("systems")).toBeInTheDocument();
      expect(screen.getByText("Systems exam")).toBeInTheDocument();
    });
  });
});
