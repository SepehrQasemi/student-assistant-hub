import { db } from "@/lib/db/app-db";
import { createId, nowIso } from "@/lib/utils";
import type { SummaryConcept, SummaryRecord, SummarySection } from "@/types/entities";

export interface SummaryCreateInput {
  fileId: string;
  extractedDocumentId: string;
  sourceFingerprint: string;
  mode: SummaryRecord["mode"];
  overview: string;
  sections: Array<{
    sectionKey: SummarySection["sectionKey"];
    order: number;
    content: string;
  }>;
  concepts: Array<{
    term: string;
    score: number;
    occurrences: number;
  }>;
}

export class SummaryRepository {
  async create(input: SummaryCreateInput) {
    const timestamp = nowIso();
    const summaryId = createId();

    const summary: SummaryRecord = {
      id: summaryId,
      fileId: input.fileId,
      extractedDocumentId: input.extractedDocumentId,
      sourceFingerprint: input.sourceFingerprint,
      mode: input.mode,
      overview: input.overview,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const sections: SummarySection[] = input.sections.map((section) => ({
      id: createId(),
      summaryId,
      sectionKey: section.sectionKey,
      order: section.order,
      content: section.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const concepts: SummaryConcept[] = input.concepts.map((concept) => ({
      id: createId(),
      summaryId,
      term: concept.term,
      score: concept.score,
      occurrences: concept.occurrences,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    await db.transaction("rw", db.summaries, db.summarySections, db.summaryConcepts, async () => {
      await db.summaries.add(summary);
      if (sections.length > 0) {
        await db.summarySections.bulkAdd(sections);
      }
      if (concepts.length > 0) {
        await db.summaryConcepts.bulkAdd(concepts);
      }
    });

    return { summary, sections, concepts };
  }

  async listByFile(fileId: string) {
    const items = await db.summaries.where("fileId").equals(fileId).toArray();
    return items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async listByFileAndMode(fileId: string, mode: SummaryRecord["mode"]) {
    const items = await db.summaries.where("[fileId+mode]").equals([fileId, mode]).toArray();
    return items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async getById(id: string) {
    return db.summaries.get(id);
  }

  async getSections(summaryId: string) {
    const items = await db.summarySections.where("summaryId").equals(summaryId).toArray();
    return items.sort((left, right) => left.order - right.order);
  }

  async getConcepts(summaryId: string) {
    const items = await db.summaryConcepts.where("summaryId").equals(summaryId).toArray();
    return items.sort((left, right) => right.score - left.score || right.occurrences - left.occurrences);
  }
}

export const summaryRepository = new SummaryRepository();
