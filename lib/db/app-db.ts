import Dexie, { type Table } from "dexie";

import type {
  AppNotification,
  AppSettings,
  CalendarEvent,
  Course,
  FileBlobRecord,
  FileTag,
  Reminder,
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
  }
}

export const db = new StudentAssistantDb();
