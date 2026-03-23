import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { courseRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";

describe("CourseFormDialog", () => {
  it("validates required fields and submits valid data", async () => {
    const user = userEvent.setup();
    const saveSpy = vi.spyOn(courseRepository, "save").mockResolvedValue({
      id: "course-1",
      name: "Algorithms",
      code: "ALG",
      instructor: "Dr. Doe",
      semester: "Spring 2026",
      color: "#0f766e",
      notes: "Important",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
      deletedAt: null,
    });

    renderWithProviders(<CourseFormDialog open onOpenChange={() => undefined} />);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("This field is required.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Algorithms");
    await user.type(screen.getByLabelText("Code"), "ALG");
    await user.type(screen.getByLabelText("Instructor"), "Dr. Doe");
    await user.type(screen.getByLabelText("Semester"), "Spring 2026");

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});
