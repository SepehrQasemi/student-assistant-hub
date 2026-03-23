import { endOfWeek, startOfWeek } from "date-fns";

import type { AppNotification, CalendarEvent, Course, Reminder, StoredFileRecord } from "@/types/entities";

export interface DashboardSnapshot {
  totalCourses: number;
  totalFiles: number;
  upcomingDeadlines: CalendarEvent[];
  upcomingExams: CalendarEvent[];
  upcomingReminders: Reminder[];
  eventsThisWeek: CalendarEvent[];
  recentFiles: StoredFileRecord[];
  unreadNotifications: AppNotification[];
}

export function buildDashboardSnapshot(input: {
  courses: Course[];
  files: StoredFileRecord[];
  events: CalendarEvent[];
  reminders: Reminder[];
  notifications: AppNotification[];
}) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const upcomingEvents = input.events
    .filter((event) => event.status !== "done" && event.startsAt >= now.toISOString())
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));

  return {
    totalCourses: input.courses.length,
    totalFiles: input.files.length,
    upcomingDeadlines: upcomingEvents.filter((event) => event.type === "deadline").slice(0, 5),
    upcomingExams: upcomingEvents.filter((event) => event.type === "exam").slice(0, 5),
    upcomingReminders: input.reminders
      .filter((reminder) => reminder.status === "scheduled")
      .sort((left, right) => (left.snoozedUntil || left.scheduledFor).localeCompare(right.snoozedUntil || right.scheduledFor))
      .slice(0, 6),
    eventsThisWeek: input.events
      .filter((event) => {
        const start = new Date(event.startsAt);
        return start >= weekStart && start <= weekEnd;
      })
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
      .slice(0, 8),
    recentFiles: input.files.slice().sort((left, right) => right.importedAt.localeCompare(left.importedAt)).slice(0, 6),
    unreadNotifications: input.notifications.filter((notification) => notification.status === "unread").slice(0, 6),
  } satisfies DashboardSnapshot;
}
