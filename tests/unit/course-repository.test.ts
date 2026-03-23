import { courseRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("course repository", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates, lists, updates, and soft deletes courses", async () => {
    const created = await courseRepository.save({
      name: "Distributed Systems",
      code: "DS-501",
      instructor: "Prof. Laurent",
      semester: "Spring 2026",
      color: "#0f766e",
      notes: "Focus on exam preparation.",
    });

    expect(created.id).toBeTruthy();

    const listed = await courseRepository.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.name).toBe("Distributed Systems");

    const updated = await courseRepository.save(
      {
        name: "Distributed Systems",
        code: "DS-501",
        instructor: "Prof. Martin",
        semester: "Spring 2026",
        color: "#1d4ed8",
        notes: "Updated note.",
      },
      created.id,
    );

    expect(updated.instructor).toBe("Prof. Martin");

    await courseRepository.remove(created.id);

    const afterDelete = await courseRepository.list();
    expect(afterDelete).toHaveLength(0);
  });
});
