export type Locale = "en" | "fr";

export type FileCategory =
  | "lecture_note"
  | "slide"
  | "assignment"
  | "exam_material"
  | "personal"
  | "other";

export type FilePreviewKind = "pdf" | "image" | "text" | "unsupported";

export type EventType = "personal" | "deadline" | "exam" | "class" | "meeting" | "other";

export type EventStatus = "scheduled" | "done";

export type ReminderMode = "offset" | "absolute";

export type ReminderStatus = "scheduled" | "dismissed" | "completed";

export type NotificationStatus = "unread" | "read" | "dismissed" | "snoozed";

export type NotificationPermissionState = "default" | "denied" | "granted" | "unsupported";

export type CalendarView = "day" | "week" | "month" | "quarter" | "agenda";

export type FileSort = "recent" | "name" | "size";

export type FileViewMode = "grid" | "list";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Course extends BaseEntity {
  name: string;
  code: string;
  instructor: string;
  semester: string;
  color: string;
  notes: string;
}

export interface FileTag extends BaseEntity {
  label: string;
  color: string;
}

export interface StoredFileRecord extends BaseEntity {
  name: string;
  originalName: string;
  courseId: string | null;
  category: FileCategory;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  notes: string;
  tagIds: string[];
  blobId: string;
  importedAt: string;
  previewKind: FilePreviewKind;
}

export interface FileBlobRecord {
  id: string;
  fileId: string;
  data: ArrayBuffer;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent extends BaseEntity {
  title: string;
  description: string;
  type: EventType;
  courseId: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location: string;
  status: EventStatus;
}

export interface Reminder extends BaseEntity {
  eventId: string;
  mode: ReminderMode;
  offsetMinutes: number | null;
  scheduledFor: string;
  snoozedUntil: string | null;
  status: ReminderStatus;
  lastTriggeredAt: string | null;
}

export interface AppNotification extends Omit<BaseEntity, "deletedAt"> {
  reminderId: string;
  eventId: string;
  title: string;
  body: string;
  scheduledFor: string;
  status: NotificationStatus;
  readAt: string | null;
}

export interface AppSettings {
  key: "app-settings";
  language: Locale;
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermissionState;
  defaultCalendarView: CalendarView;
  compactFileCards: boolean;
  weekStartsOn: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderFormValue {
  id: string;
  mode: ReminderMode;
  offsetMinutes: number | null;
  scheduledFor: string;
}

export interface FileFilters {
  search: string;
  courseId: string;
  category: FileCategory | "all";
  fileType: string;
  sort: FileSort;
  viewMode: FileViewMode;
}
