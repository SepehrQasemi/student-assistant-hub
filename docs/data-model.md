# Local Data Model

## Overview

Phase 1 data is stored locally in IndexedDB through Dexie. The schema is versioned to stay migration-friendly and future-sync-ready.

All primary entities use:

- `id`
- `createdAt`
- `updatedAt`
- optional `deletedAt` where soft delete improves future sync compatibility

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

Stores local file metadata separately from raw blobs.

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
- `createdAt`
- `updatedAt`
- `deletedAt`

### Relationships

- many files can belong to one course
- one file references one local blob record
- one file can link to many tags through `tagIds`

## Table: fileBlobs

### Purpose

Stores the raw file blob for offline use.

### Main Fields

- `id`
- `fileId`
- `blob`
- `createdAt`
- `updatedAt`

### Notes

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
- `mode` (`offset` or `absolute`)
- `offsetMinutes`
- `scheduledFor`
- `snoozedUntil`
- `status`
- `lastTriggeredAt`
- `createdAt`
- `updatedAt`
- `deletedAt`

### Notes

- one event can have multiple reminders
- `scheduledFor` is stored explicitly for scheduling simplicity
- offset-based reminders are recalculated when the event changes

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

### Notes

- in-app notifications remain available even if the browser notification was missed

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

## Future Extension Notes

The local model is designed to support later phases without breaking Phase 1:

- sync metadata can be added later
- AI tables can remain additive
- repository interfaces can gain remote implementations while retaining the same UI contracts
