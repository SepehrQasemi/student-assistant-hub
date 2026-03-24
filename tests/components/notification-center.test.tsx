import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { NotificationCenter } from "@/components/layout/notification-center";
import { eventRepository, notificationRepository, reminderRepository, settingsRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

async function seedNotification() {
  const event = await eventRepository.save({
    title: "Distributed Systems Exam",
    description: "",
    type: "exam",
    courseId: null,
    startsAt: "2030-04-01T09:00:00.000Z",
    endsAt: "2030-04-01T11:00:00.000Z",
    allDay: false,
    location: "",
    status: "scheduled",
  });

  await reminderRepository.replaceForEvent(event.id, [
    {
      id: "reminder-1",
      mode: "offset",
      offsetMinutes: 30,
      scheduledFor: "2030-04-01T08:30:00.000Z",
    },
  ]);

  const reminder = (await reminderRepository.listByEvent(event.id))[0]!;
  const notification = await notificationRepository.createIfMissing({
    reminderId: reminder.id,
    eventId: event.id,
    title: "Exam reminder",
    body: "Review replication and consensus.",
    scheduledFor: reminder.scheduledFor,
  });

  return { event, reminder, notification };
}

describe("NotificationCenter", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("renders an empty state when there are no notifications", async () => {
    renderWithProviders(<NotificationCenter />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Notification center" }));

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  it("marks a notification as done and updates the related event and reminder", async () => {
    const { event, reminder, notification } = await seedNotification();
    renderWithProviders(<NotificationCenter />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Notification center" }));
    await user.click(screen.getByRole("button", { name: "Mark event done" }));

    await waitFor(async () => {
      expect((await eventRepository.getById(event.id))?.status).toBe("done");
      expect((await reminderRepository.getById(reminder.id))?.status).toBe("completed");
      expect((await notificationRepository.list()).find((item) => item.id === notification.id)?.status).toBe("read");
    });
  });

  it("supports snoozing notifications", async () => {
    const { reminder, notification } = await seedNotification();
    renderWithProviders(<NotificationCenter />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Notification center" }));
    await user.click(screen.getByRole("button", { name: "Snooze" }));

    await waitFor(async () => {
      expect((await reminderRepository.getById(reminder.id))?.snoozedUntil).toBeTruthy();
      expect((await notificationRepository.list()).find((item) => item.id === notification.id)?.status).toBe("snoozed");
    });
  });
});
