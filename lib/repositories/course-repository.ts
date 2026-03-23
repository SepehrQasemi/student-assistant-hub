import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { Course } from "@/types/entities";

export type CourseInput = Omit<Course, "id" | "createdAt" | "updatedAt" | "deletedAt">;

export class CourseRepository {
  async list() {
    const items = await db.courses.toArray();

    return items
      .filter((item) => !item.deletedAt)
      .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
  }

  async getById(id: string) {
    const item = await db.courses.get(id);
    return item && !item.deletedAt ? item : undefined;
  }

  async save(input: CourseInput, id?: string) {
    const timestamp = nowIso();

    if (id) {
      const existing = await db.courses.get(id);

      if (!existing) {
        throw new Error(`Course ${id} not found`);
      }

      const nextCourse: Course = {
        ...existing,
        ...input,
        updatedAt: timestamp,
        deletedAt: null,
      };

      await db.courses.put(nextCourse);
      return nextCourse;
    }

    const course: Course = {
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await db.courses.add(course);
    return course;
  }

  async remove(id: string) {
    const existing = await db.courses.get(id);

    if (!existing) {
      return;
    }

    await db.courses.put({
      ...existing,
      updatedAt: nowIso(),
      deletedAt: nowIso(),
    });
  }
}

export const courseRepository = new CourseRepository();
