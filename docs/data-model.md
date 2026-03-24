# Local Data Model

## Overview

Student Assistant Hub stores Phase 1 and Phase 2 data locally in IndexedDB through Dexie. The schema remains versioned so the application can evolve without collapsing into ad hoc persistence.

All primary entities use:

- `id`
- `createdAt`
- `updatedAt`
- optional `deletedAt` where soft delete improves future migration or sync compatibility

## Controlled Values

### File Categories

- `lecture_note`
- `slide`
- `assignment`
- `exam_material`
- `personal`
- `other`

### Event Types

- `personal`
- `deadline`
- `exam`
- `class`
- `meeting`
- `other`

### Document Types

- `plain_text`
- `markdown`
- `pdf_text`
- `unsupported`

### Extraction Statuses

- `pending`
- `success`
- `failed`
- `unsupported`
- `empty`

### Summary Modes

- `quick_summary`
- `structured_summary`
- `study_notes`
- `key_concepts`

## Table: courses

### Purpose

Organizes the academic workspace by subject or course.

### Main Fields

- `id`
- `name`
- `code`
- `instructor`
- `semester`
- `color`
- `notes`
- `createdAt`
- `updatedAt`
- `deletedAt`

### Relationships

- one course can be linked to many files
- one course can be linked to many events

## Table: files

### Purpose

Stores local file metadata separately from raw blobs and now carries source fingerprint data for Phase 2 stale detection.

### Main Fields

- `id`
- `name`
- `originalName`
- `courseId`
- `category`
- `mimeType`
- `extension`
- `sizeBytes`
- `notes`
- `tagIds`
- `blobId`
- `importedAt`
- `previewKind`
- `contentFingerprint`
- `contentUpdatedAt`
- `createdAt`
- `updatedAt`
- `deletedAt`

### Relationships

- many files can belong to one course
- one file references one local blob record
- one file can link to many tags through `tagIds`
- one file can have many extracted-document artifacts
- one file can have many summaries

### Notes and Constraints

- `contentFingerprint` changes only when the source content changes
- metadata-only edits must not invalidate summaries

## Table: fileBlobs

### Purpose

Stores the raw file data for offline use.

### Main Fields

- `id`
- `fileId`
- `data`
- `mimeType`
- `createdAt`
- `updatedAt`

### Notes and Constraints

- large-file support depends on browser IndexedDB quotas
- metadata queries should avoid loading blobs unless required

## Table: tags

### Purpose

Supports optional tagging for file organization.

### Main Fields

- `id`
- `label`
- `color`
- `createdAt`
- `updatedAt`
- `deletedAt`

## Table: events

### Purpose

Stores calendar events for classes, deadlines, exams, meetings, and personal planning.

### Main Fields

- `id`
- `title`
- `description`
- `type`
- `courseId`
- `startsAt`
- `endsAt`
- `allDay`
- `location`
- `status`
- `createdAt`
- `updatedAt`
- `deletedAt`

### Relationships

- many events can belong to one course
- one event can have many reminders

## Table: reminders

### Purpose

Stores reminder scheduling rules for events.

### Main Fields

- `id`
- `eventId`
- `mode`
- `offsetMinutes`
- `scheduledFor`
- `snoozedUntil`
- `status`
- `lastTriggeredAt`
- `createdAt`
- `updatedAt`
- `deletedAt`

## Table: notifications

### Purpose

Stores in-app notification records created by the reminder engine.

### Main Fields

- `id`
- `reminderId`
- `eventId`
- `title`
- `body`
- `scheduledFor`
- `status`
- `readAt`
- `createdAt`
- `updatedAt`

## Table: settings

### Purpose

Stores app-level preferences and capability state.

### Main Fields

- `key`
- `language`
- `notificationsEnabled`
- `notificationPermission`
- `defaultCalendarView`
- `compactFileCards`
- `weekStartsOn`
- `createdAt`
- `updatedAt`

## Table: extractedDocuments

### Purpose

Stores the result of attempting to extract text from a file for Phase 2 processing.

### Main Fields

- `id`
- `fileId`
- `sourceFingerprint`
- `sourceUpdatedAt`
- `documentType`
- `status`
- `rawText`
- `normalizedText`
- `characterCount`
- `chunkCount`
- `errorMessage`
- `createdAt`
- `updatedAt`

### Relationships

- many extracted-document records can belong to one file
- one extracted-document record can be referenced by many summaries created from that same source fingerprint

### Notes and Constraints

- extraction state is explicit and persisted
- `normalizedText` may be empty when status is `unsupported`, `failed`, or `empty`
- an extracted-document record is tied to the file fingerprint used when it was created

## Table: summaries

### Purpose

Stores generated local summary artifacts tied to a file and a specific extracted document version.

### Main Fields

- `id`
- `fileId`
- `extractedDocumentId`
- `sourceFingerprint`
- `mode`
- `overview`
- `createdAt`
- `updatedAt`

### Relationships

- many summaries can belong to one file
- many summaries can reference one extracted-document artifact
- one summary can have many summary sections
- one summary can have many concept artifacts

### Notes and Constraints

- summaries are never assumed current unless their `sourceFingerprint` matches the file fingerprint
- summary history is preserved per file and per mode

## Table: summarySections

### Purpose

Stores sectioned summary output separately from the summary header record.

### Main Fields

- `id`
- `summaryId`
- `sectionKey`
- `order`
- `content`
- `createdAt`
- `updatedAt`

### Notes and Constraints

- `sectionKey` is a stable key rendered through the i18n layer rather than a stored translated heading
- this allows the UI language to change without rewriting stored artifacts

## Table: summaryConcepts

### Purpose

Stores extracted important terms or concepts associated with a summary.

### Main Fields

- `id`
- `summaryId`
- `term`
- `score`
- `occurrences`
- `createdAt`
- `updatedAt`

### Notes and Constraints

- concept terms must come from the source text
- scores are heuristic weights used for ordering, not confidence guarantees

## Future Extension Notes

The Phase 2 model is designed so later phases can build on it:

- quiz generation can reuse extracted text and deterministic chunking
- quiz workflows can reuse concept artifacts
- export/sync can treat extracted documents and summaries as additive local artifacts
