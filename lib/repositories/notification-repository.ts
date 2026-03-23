import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { AppNotification } from "@/types/entities";

export interface NotificationInput {
  reminderId: string;
  eventId: string;
  title: string;
  body: string;
  scheduledFor: string;
}

export class NotificationRepository {
  async list() {
    const items = await db.notifications.toArray();
    return items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createIfMissing(input: NotificationInput) {
    const existing = await db.notifications
      .where("[reminderId+scheduledFor]")
      .equals([input.reminderId, input.scheduledFor] as [string, string])
      .first()
      .catch(() => undefined);

    if (existing) {
      return existing;
    }

    const timestamp = nowIso();
    const notification: AppNotification = {
      id: createId(),
      ...input,
      status: "unread",
      readAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.notifications.add(notification);
    return notification;
  }

  async markRead(id: string) {
    const existing = await db.notifications.get(id);

    if (!existing) {
      return;
    }

    const timestamp = nowIso();

    await db.notifications.put({
      ...existing,
      status: "read",
      readAt: timestamp,
      updatedAt: timestamp,
    });
  }

  async dismiss(id: string) {
    const existing = await db.notifications.get(id);

    if (!existing) {
      return;
    }

    await db.notifications.put({
      ...existing,
      status: "dismissed",
      updatedAt: nowIso(),
    });
  }

  async markSnoozed(id: string) {
    const existing = await db.notifications.get(id);

    if (!existing) {
      return;
    }

    await db.notifications.put({
      ...existing,
      status: "snoozed",
      updatedAt: nowIso(),
    });
  }
}

export const notificationRepository = new NotificationRepository();
