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

export type DocumentType = "plain_text" | "markdown" | "pdf_text" | "unsupported";

export type ExtractionStatus = "pending" | "success" | "failed" | "unsupported" | "empty";

export type SummaryMode = "quick_summary" | "structured_summary" | "study_notes" | "key_concepts";
export type QuizMode = "multiple_choice" | "true_false" | "mixed";
export type QuizFocusMode = "key_concepts" | "balanced" | "review";
export type QuizQuestionType = "multiple_choice" | "true_false";
export type QuizQuestionFocusTag = "key_concepts" | "balanced" | "review";

export type SummarySectionKey =
  | "overview"
  | "mainTopics"
  | "keyIdeas"
  | "importantDetails"
  | "reviewFirst"
  | "watchFor"
  | "concepts";

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
  contentFingerprint: string;
  contentUpdatedAt: string;
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

export interface ExtractedDocument extends Omit<BaseEntity, "deletedAt"> {
  fileId: string;
  sourceFingerprint: string;
  sourceUpdatedAt: string;
  documentType: DocumentType;
  status: ExtractionStatus;
  rawText: string;
  normalizedText: string;
  characterCount: number;
  chunkCount: number;
  errorMessage: string | null;
}

export interface SummaryRecord extends Omit<BaseEntity, "deletedAt"> {
  fileId: string;
  extractedDocumentId: string;
  sourceFingerprint: string;
  mode: SummaryMode;
  overview: string;
}

export interface SummarySection extends Omit<BaseEntity, "deletedAt"> {
  summaryId: string;
  sectionKey: SummarySectionKey;
  order: number;
  content: string;
}

export interface SummaryConcept extends Omit<BaseEntity, "deletedAt"> {
  summaryId: string;
  term: string;
  score: number;
  occurrences: number;
}

export interface QuizRecord extends Omit<BaseEntity, "deletedAt"> {
  sourceFileId: string;
  extractedDocumentId: string;
  sourceFingerprint: string;
  title: string;
  mode: QuizMode;
  focusMode: QuizFocusMode;
  includeExplanations: boolean;
  questionCount: number;
}

export interface QuizQuestion extends Omit<BaseEntity, "deletedAt"> {
  quizId: string;
  type: QuizQuestionType;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  sourceHint: string;
  focusTag: QuizQuestionFocusTag;
  order: number;
}

export interface QuizAttempt extends Omit<BaseEntity, "deletedAt"> {
  quizId: string;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  mode: QuizMode;
}

export interface QuizAnswer extends Omit<BaseEntity, "deletedAt"> {
  attemptId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  evaluatedAt: string;
}

export interface QuizGenerationOptions {
  questionCount: 5 | 10 | 15;
  mode: QuizMode;
  focusMode: QuizFocusMode;
  includeExplanations: boolean;
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
