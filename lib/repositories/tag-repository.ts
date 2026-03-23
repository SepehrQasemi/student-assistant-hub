import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { FileTag } from "@/types/entities";

export type TagInput = Pick<FileTag, "label" | "color">;

export class TagRepository {
  async list() {
    const items = await db.tags.toArray();
    return items
      .filter((item) => !item.deletedAt)
      .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" }));
  }

  async create(input: TagInput) {
    const timestamp = nowIso();
    const tag: FileTag = {
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    await db.tags.add(tag);
    return tag;
  }

  async findOrCreateMany(labels: string[]) {
    const normalizedLabels = [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
    const existing = await this.list();
    const created: FileTag[] = [];

    for (const label of normalizedLabels) {
      const match = existing.find((tag) => tag.label.toLowerCase() === label.toLowerCase());

      if (match) {
        created.push(match);
        continue;
      }

      const nextTag = await this.create({
        label,
        color: "#94a3b8",
      });
      created.push(nextTag);
    }

    return created;
  }
}

export const tagRepository = new TagRepository();
