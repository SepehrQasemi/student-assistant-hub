import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { Reminder, ReminderFormValue } from "@/types/entities";

export class ReminderRepository {
  async list() {
    const items = await db.reminders.toArray();
    return items
      .filter((item) => !item.deletedAt)
      .sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor));
  }

  async listByEvent(eventId: string) {
    const items = await db.reminders.where("eventId").equals(eventId).toArray();
    return items
      .filter((item) => !item.deletedAt)
      .sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor));
  }

  async getById(id: string) {
    const reminder = await db.reminders.get(id);
    return reminder && !reminder.deletedAt ? reminder : undefined;
  }

  async replaceForEvent(eventId: string, reminders: ReminderFormValue[]) {
    const existing = await this.listByEvent(eventId);
    const nextIds = new Set(reminders.map((reminder) => reminder.id).filter(Boolean));
    const timestamp = nowIso();

    await db.transaction("rw", db.reminders, async () => {
      for (const reminder of reminders) {
        const record: Reminder = {
          id: reminder.id || createId(),
          eventId,
          mode: reminder.mode,
          offsetMinutes: reminder.offsetMinutes,
          scheduledFor: reminder.scheduledFor,
          snoozedUntil: null,
          status: "scheduled",
          lastTriggeredAt: null,
          createdAt: existing.find((item) => item.id === reminder.id)?.createdAt ?? timestamp,
          updatedAt: timestamp,
          deletedAt: null,
        };

        await db.reminders.put(record);
      }

      for (const reminder of existing) {
        if (!nextIds.has(reminder.id)) {
          await db.reminders.put({
            ...reminder,
            deletedAt: timestamp,
            updatedAt: timestamp,
          });
        }
      }
    });
  }

  async markTriggered(id: string, triggeredAt = nowIso()) {
    const existing = await db.reminders.get(id);

    if (!existing) {
      return;
    }

    await db.reminders.put({
      ...existing,
      lastTriggeredAt: triggeredAt,
      updatedAt: triggeredAt,
    });
  }

  async snooze(id: string, snoozedUntil: string) {
    const existing = await db.reminders.get(id);

    if (!existing) {
      return;
    }

    await db.reminders.put({
      ...existing,
      snoozedUntil,
      lastTriggeredAt: null,
      updatedAt: nowIso(),
    });
  }

  async dismiss(id: string) {
    const existing = await db.reminders.get(id);

    if (!existing) {
      return;
    }

    await db.reminders.put({
      ...existing,
      status: "dismissed",
      updatedAt: nowIso(),
    });
  }

  async completeByEvent(eventId: string) {
    const reminders = await this.listByEvent(eventId);

    await Promise.all(
      reminders.map((reminder) =>
        db.reminders.put({
          ...reminder,
          status: "completed",
          updatedAt: nowIso(),
        }),
      ),
    );
  }

  async removeByEvent(eventId: string) {
    const reminders = await this.listByEvent(eventId);

    await Promise.all(
      reminders.map((reminder) =>
        db.reminders.put({
          ...reminder,
          deletedAt: nowIso(),
          updatedAt: nowIso(),
        }),
      ),
    );
  }
}

export const reminderRepository = new ReminderRepository();
