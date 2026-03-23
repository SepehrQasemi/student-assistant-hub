import { notificationRepository } from "@/lib/repositories";
import {
  calculateReminderSchedule,
  getReminderDisplayState,
  getEffectiveReminderDate,
  isReminderDue,
} from "@/lib/services/reminder-engine";
import { resetDb } from "@/tests/test-utils/reset-db";
import type { Reminder } from "@/types/entities";

const baseReminder: Reminder = {
  id: "reminder-1",
  eventId: "event-1",
  mode: "offset",
  offsetMinutes: 15,
  scheduledFor: "2026-04-01T09:45:00.000Z",
  snoozedUntil: null,
  status: "scheduled",
  lastTriggeredAt: null,
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-01T09:00:00.000Z",
  deletedAt: null,
};

describe("reminder engine utilities", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("calculates offset and absolute reminder schedules", () => {
    expect(
      calculateReminderSchedule("2026-04-01T10:00:00.000Z", {
        id: "a",
        mode: "offset",
        offsetMinutes: 15,
        scheduledFor: "2026-04-01T10:00:00.000Z",
      }),
    ).toBe("2026-04-01T09:45:00.000Z");

    expect(
      calculateReminderSchedule("2026-04-01T10:00:00.000Z", {
        id: "b",
        mode: "absolute",
        offsetMinutes: null,
        scheduledFor: "2026-03-31T18:00:00.000Z",
      }),
    ).toBe("2026-03-31T18:00:00.000Z");
  });

  it("detects due reminders and overdue display state", () => {
    expect(isReminderDue(baseReminder, "2026-04-01T09:46:00.000Z")).toBe(true);
    expect(getReminderDisplayState(baseReminder, "2026-04-01T09:46:00.000Z")).toBe("overdue");
    expect(getEffectiveReminderDate(baseReminder)).toBe("2026-04-01T09:45:00.000Z");
  });

  it("deduplicates notifications for the same reminder schedule", async () => {
    const first = await notificationRepository.createIfMissing({
      reminderId: "reminder-1",
      eventId: "event-1",
      title: "Reminder",
      body: "Event due",
      scheduledFor: "2026-04-01T09:45:00.000Z",
    });

    const second = await notificationRepository.createIfMissing({
      reminderId: "reminder-1",
      eventId: "event-1",
      title: "Reminder",
      body: "Event due",
      scheduledFor: "2026-04-01T09:45:00.000Z",
    });

    expect(second.id).toBe(first.id);
  });
});
