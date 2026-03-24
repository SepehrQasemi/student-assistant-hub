import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import { eventRepository, settingsRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("CalendarPageClient", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("renders the agenda view cleanly when selected from the calendar page", async () => {
    await eventRepository.save({
      title: "Distributed Systems Exam",
      description: "Final review",
      type: "exam",
      courseId: null,
      startsAt: "2030-04-01T09:00:00.000Z",
      endsAt: "2030-04-01T11:00:00.000Z",
      allDay: false,
      location: "Campus A",
      status: "scheduled",
    });

    renderWithProviders(<CalendarPageClient />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Calendar" })).toBeInTheDocument();
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    }, { timeout: 10000 });

    await user.click(screen.getByRole("button", { name: "Agenda" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Agenda" })).toBeInTheDocument();
      expect(screen.getByText("Distributed Systems Exam")).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);
});
