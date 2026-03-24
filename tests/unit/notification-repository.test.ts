import { notificationRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("notification repository", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("deduplicates notifications by reminder and scheduled time", async () => {
    const first = await notificationRepository.createIfMissing({
      reminderId: "reminder-1",
      eventId: "event-1",
      title: "Reminder",
      body: "Review replication",
      scheduledFor: "2026-03-24T10:00:00.000Z",
    });
    const second = await notificationRepository.createIfMissing({
      reminderId: "reminder-1",
      eventId: "event-1",
      title: "Reminder",
      body: "Review replication",
      scheduledFor: "2026-03-24T10:00:00.000Z",
    });

    const items = await notificationRepository.list();
    expect(second.id).toBe(first.id);
    expect(items).toHaveLength(1);
  });

  it("updates notification status transitions", async () => {
    const notification = await notificationRepository.createIfMissing({
      reminderId: "reminder-1",
      eventId: "event-1",
      title: "Reminder",
      body: "Review replication",
      scheduledFor: "2026-03-24T10:00:00.000Z",
    });

    await notificationRepository.markRead(notification.id);
    let stored = (await notificationRepository.list())[0]!;
    expect(stored.status).toBe("read");
    expect(stored.readAt).toBeTruthy();

    await notificationRepository.markSnoozed(notification.id);
    stored = (await notificationRepository.list())[0]!;
    expect(stored.status).toBe("snoozed");

    await notificationRepository.dismiss(notification.id);
    stored = (await notificationRepository.list())[0]!;
    expect(stored.status).toBe("dismissed");
  });
});
