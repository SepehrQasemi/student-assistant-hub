import Dexie, { type Table } from "dexie";

import type {
  AppNotification,
  AppSettings,
  CalendarEvent,
  Course,
  ExtractedDocument,
  FileBlobRecord,
  FileTag,
  Reminder,
  SummaryConcept,
  SummaryRecord,
  SummarySection,
  StoredFileRecord,
} from "@/types/entities";

export class StudentAssistantDb extends Dexie {
  courses!: Table<Course, string>;
  files!: Table<StoredFileRecord, string>;
  fileBlobs!: Table<FileBlobRecord, string>;
  tags!: Table<FileTag, string>;
  events!: Table<CalendarEvent, string>;
  reminders!: Table<Reminder, string>;
  notifications!: Table<AppNotification, string>;
  settings!: Table<AppSettings, string>;
  extractedDocuments!: Table<ExtractedDocument, string>;
  summaries!: Table<SummaryRecord, string>;
  summarySections!: Table<SummarySection, string>;
  summaryConcepts!: Table<SummaryConcept, string>;

  constructor() {
    super("student-assistant-hub");

    this.version(1).stores({
      courses: "id, name, code, semester, updatedAt, deletedAt",
      files: "id, name, originalName, courseId, category, mimeType, extension, importedAt, updatedAt, deletedAt, *tagIds",
      fileBlobs: "id, fileId, updatedAt",
      tags: "id, label, updatedAt, deletedAt",
      events: "id, title, type, courseId, startsAt, endsAt, status, updatedAt, deletedAt",
      reminders: "id, eventId, mode, scheduledFor, snoozedUntil, status, updatedAt, deletedAt",
      notifications: "id, reminderId, eventId, status, scheduledFor, createdAt, updatedAt, [reminderId+scheduledFor]",
      settings: "key, updatedAt",
    });

    this.version(2)
      .stores({
        courses: "id, name, code, semester, updatedAt, deletedAt",
        files:
          "id, name, originalName, courseId, category, mimeType, extension, importedAt, updatedAt, contentUpdatedAt, contentFingerprint, deletedAt, *tagIds",
        fileBlobs: "id, fileId, updatedAt",
        tags: "id, label, updatedAt, deletedAt",
        events: "id, title, type, courseId, startsAt, endsAt, status, updatedAt, deletedAt",
        reminders: "id, eventId, mode, scheduledFor, snoozedUntil, status, updatedAt, deletedAt",
        notifications: "id, reminderId, eventId, status, scheduledFor, createdAt, updatedAt, [reminderId+scheduledFor]",
        settings: "key, updatedAt",
        extractedDocuments: "id, fileId, sourceFingerprint, sourceUpdatedAt, documentType, status, updatedAt, [fileId+sourceFingerprint]",
        summaries: "id, fileId, extractedDocumentId, sourceFingerprint, mode, createdAt, [fileId+createdAt], [fileId+mode]",
        summarySections: "id, summaryId, sectionKey, order",
        summaryConcepts: "id, summaryId, term, score",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<StoredFileRecord, string>("files")
          .toCollection()
          .modify((file) => {
            file.contentFingerprint = file.contentFingerprint || "";
            file.contentUpdatedAt = file.contentUpdatedAt || file.updatedAt || file.importedAt;
          });
      });
  }
}

export const db = new StudentAssistantDb();
