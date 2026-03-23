import { eventRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("event repository", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates, updates, lists upcoming events, and soft deletes events", async () => {
    const created = await eventRepository.save({
      title: "Databases exam",
      description: "Final exam block",
      type: "exam",
      courseId: null,
      startsAt: "2026-04-01T08:00:00.000Z",
      endsAt: "2026-04-01T10:00:00.000Z",
      allDay: false,
      location: "Hall B",
      status: "scheduled",
    });

    const upcoming = await eventRepository.listUpcoming("2026-03-20T00:00:00.000Z");
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.title).toBe("Databases exam");

    const updated = await eventRepository.save(
      {
        title: "Databases exam",
        description: "Updated location",
        type: "exam",
        courseId: null,
        startsAt: "2026-04-01T08:00:00.000Z",
        endsAt: "2026-04-01T10:00:00.000Z",
        allDay: false,
        location: "Hall C",
        status: "scheduled",
      },
      created.id,
    );

    expect(updated.location).toBe("Hall C");

    await eventRepository.remove(created.id);

    const afterDelete = await eventRepository.list();
    expect(afterDelete).toHaveLength(0);
  });
});
