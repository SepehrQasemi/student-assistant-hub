import { buildDashboardSnapshot } from "@/lib/services/dashboard-service";
import type { AppNotification, CalendarEvent, Course, Reminder, StoredFileRecord } from "@/types/entities";

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: overrides.id ?? "course-1",
    name: overrides.name ?? "Distributed Systems",
    code: overrides.code ?? "MIAGE-DS",
    instructor: overrides.instructor ?? "Dr Martin",
    semester: overrides.semester ?? "Spring 2026",
    color: overrides.color ?? "#2563eb",
    notes: overrides.notes ?? "",
    createdAt: overrides.createdAt ?? "2026-03-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-20T08:00:00.000Z",
    deletedAt: overrides.deletedAt ?? null,
  };
}

function makeFile(overrides: Partial<StoredFileRecord> = {}): StoredFileRecord {
  return {
    id: overrides.id ?? "file-1",
    name: overrides.name ?? "distributed-notes",
    originalName: overrides.originalName ?? "distributed-notes.md",
    courseId: overrides.courseId ?? "course-1",
    category: overrides.category ?? "lecture_note",
    mimeType: overrides.mimeType ?? "text/markdown",
    extension: overrides.extension ?? "md",
    sizeBytes: overrides.sizeBytes ?? 1024,
    notes: overrides.notes ?? "",
    tagIds: overrides.tagIds ?? [],
    blobId: overrides.blobId ?? "blob-1",
    importedAt: overrides.importedAt ?? "2026-03-23T09:00:00.000Z",
    previewKind: overrides.previewKind ?? "text",
    contentFingerprint: overrides.contentFingerprint ?? "fingerprint-1",
    contentUpdatedAt: overrides.contentUpdatedAt ?? "2026-03-23T09:00:00.000Z",
    createdAt: overrides.createdAt ?? "2026-03-23T09:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-23T09:00:00.000Z",
    deletedAt: overrides.deletedAt ?? null,
  };
}

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: overrides.id ?? "event-1",
    title: overrides.title ?? "Distributed Systems Exam",
    description: overrides.description ?? "",
    type: overrides.type ?? "exam",
    courseId: overrides.courseId ?? "course-1",
    startsAt: overrides.startsAt ?? "2099-03-28T09:00:00.000Z",
    endsAt: overrides.endsAt ?? "2099-03-28T10:00:00.000Z",
    allDay: overrides.allDay ?? false,
    location: overrides.location ?? "",
    status: overrides.status ?? "scheduled",
    createdAt: overrides.createdAt ?? "2026-03-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-20T08:00:00.000Z",
    deletedAt: overrides.deletedAt ?? null,
  };
}

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: overrides.id ?? "reminder-1",
    eventId: overrides.eventId ?? "event-1",
    mode: overrides.mode ?? "offset",
    offsetMinutes: overrides.offsetMinutes ?? 30,
    scheduledFor: overrides.scheduledFor ?? "2099-03-28T08:30:00.000Z",
    snoozedUntil: overrides.snoozedUntil ?? null,
    status: overrides.status ?? "scheduled",
    lastTriggeredAt: overrides.lastTriggeredAt ?? null,
    createdAt: overrides.createdAt ?? "2026-03-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-20T08:00:00.000Z",
    deletedAt: overrides.deletedAt ?? null,
  };
}

function makeNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: overrides.id ?? "notification-1",
    reminderId: overrides.reminderId ?? "reminder-1",
    eventId: overrides.eventId ?? "event-1",
    title: overrides.title ?? "Reminder",
    body: overrides.body ?? "Upcoming exam",
    scheduledFor: overrides.scheduledFor ?? "2099-03-28T08:30:00.000Z",
    status: overrides.status ?? "unread",
    readAt: overrides.readAt ?? null,
    createdAt: overrides.createdAt ?? "2026-03-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-20T08:00:00.000Z",
  };
}

describe("buildDashboardSnapshot", () => {
  it("sorts and slices critical dashboard collections", () => {
    const snapshot = buildDashboardSnapshot({
      courses: [makeCourse()],
      files: [
        makeFile({ id: "file-2", importedAt: "2026-03-23T12:00:00.000Z", name: "more-recent" }),
        makeFile({ id: "file-1", importedAt: "2026-03-22T12:00:00.000Z", name: "older" }),
      ],
      events: [
        makeEvent({ id: "event-1", type: "deadline", startsAt: "2099-03-25T09:00:00.000Z", title: "Essay deadline" }),
        makeEvent({ id: "event-2", type: "exam", startsAt: "2099-03-26T09:00:00.000Z", title: "Exam" }),
        makeEvent({ id: "event-3", type: "deadline", startsAt: "2099-03-24T09:00:00.000Z", title: "Soonest deadline" }),
      ],
      reminders: [
        makeReminder({ id: "reminder-2", scheduledFor: "2099-03-24T07:45:00.000Z" }),
        makeReminder({ id: "reminder-1", scheduledFor: "2099-03-24T08:30:00.000Z" }),
      ],
      notifications: [makeNotification(), makeNotification({ id: "notification-2", status: "read" })],
    });

    expect(snapshot.totalCourses).toBe(1);
    expect(snapshot.totalFiles).toBe(2);
    expect(snapshot.upcomingDeadlines.map((event) => event.title)).toEqual(["Soonest deadline", "Essay deadline"]);
    expect(snapshot.upcomingExams.map((event) => event.title)).toEqual(["Exam"]);
    expect(snapshot.upcomingReminders.map((reminder) => reminder.id)).toEqual(["reminder-2", "reminder-1"]);
    expect(snapshot.recentFiles.map((file) => file.name)).toEqual(["more-recent", "older"]);
    expect(snapshot.unreadNotifications).toHaveLength(1);
  });

  it("ignores done events and non-scheduled reminders for upcoming lists", () => {
    const snapshot = buildDashboardSnapshot({
      courses: [],
      files: [],
      events: [
        makeEvent({ id: "event-1", type: "deadline", startsAt: "2099-03-25T09:00:00.000Z", status: "done" }),
        makeEvent({ id: "event-2", type: "exam", startsAt: "2099-03-26T09:00:00.000Z", status: "scheduled" }),
      ],
      reminders: [
        makeReminder({ id: "reminder-1", status: "dismissed" }),
        makeReminder({ id: "reminder-2", status: "scheduled" }),
      ],
      notifications: [],
    });

    expect(snapshot.upcomingDeadlines).toEqual([]);
    expect(snapshot.upcomingExams.map((event) => event.id)).toEqual(["event-2"]);
    expect(snapshot.upcomingReminders.map((reminder) => reminder.id)).toEqual(["reminder-2"]);
  });
});
