import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { CalendarEvent } from "@/types/entities";

export type EventInput = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "deletedAt">;

export class EventRepository {
  async list() {
    const items = await db.events.toArray();
    return items
      .filter((item) => !item.deletedAt)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  }

  async listUpcoming(fromIso = nowIso()) {
    const items = await this.list();
    return items
      .filter((item) => item.status !== "done" && item.startsAt >= fromIso)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  }

  async getById(id: string) {
    const item = await db.events.get(id);
    return item && !item.deletedAt ? item : undefined;
  }

  async save(input: EventInput, id?: string) {
    const timestamp = nowIso();

    if (id) {
      const existing = await db.events.get(id);

      if (!existing) {
        throw new Error(`Event ${id} not found`);
      }

      const nextEvent: CalendarEvent = {
        ...existing,
        ...input,
        updatedAt: timestamp,
        deletedAt: null,
      };

      await db.events.put(nextEvent);
      return nextEvent;
    }

    const event: CalendarEvent = {
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await db.events.add(event);
    return event;
  }

  async markDone(id: string) {
    const existing = await db.events.get(id);

    if (!existing) {
      return;
    }

    await db.events.put({
      ...existing,
      status: "done",
      updatedAt: nowIso(),
    });
  }

  async remove(id: string) {
    const existing = await db.events.get(id);

    if (!existing) {
      return;
    }

    await db.events.put({
      ...existing,
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
}

export const eventRepository = new EventRepository();
