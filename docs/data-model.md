# Local Data Model

## Overview

Student Assistant Hub stores all product data locally in IndexedDB through Dexie. The data model now supports the completed workspace, summary, and quiz flows without relying on any backend service.

Every primary persisted entity uses stable IDs and timestamps. Derived study artifacts are stored separately from source file records so that history and stale detection remain explicit.

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

### Quiz Modes

- `multiple_choice`
- `true_false`
- `mixed`

### Quiz Focus Modes

- `balanced`
- `key_concepts`
- `review`

### Quiz Question Types

- `multiple_choice`
- `true_false`

Short-answer is intentionally not stored as an active question type because it is still deferred.

## Core Workspace Tables

### `courses`

Purpose:

- stores course structure used by files and events

Main fields:

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

### `files`

Purpose:

- stores local file metadata and current source version information

Main fields:

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

Notes:

- metadata edits do not invalidate summaries or quizzes
- source replacement changes `contentFingerprint` and `contentUpdatedAt`

### `fileBlobs`

Purpose:

- stores the raw local file payload

Main fields:

- `id`
- `fileId`
- `data`
- `mimeType`
- `createdAt`
- `updatedAt`

### `tags`

Purpose:

- supports optional file tagging

Main fields:

- `id`
- `label`
- `color`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `events`

Purpose:

- stores local calendar events

Main fields:

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

### `reminders`

Purpose:

- stores reminder scheduling for events

Main fields:

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

### `notifications`

Purpose:

- stores in-app notification records

Main fields:

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

### `settings`

Purpose:

- stores local preferences and capability state

Main fields:

- `key`
- `language`
- `notificationsEnabled`
- `notificationPermission`
- `defaultCalendarView`
- `compactFileCards`
- `weekStartsOn`
- `createdAt`
- `updatedAt`

## Phase 2 Document Tables

### `extractedDocuments`

Purpose:

- stores extraction attempts and normalized text per file fingerprint

Main fields:

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

Notes:

- extraction status remains explicit
- one file can accumulate extraction history across source replacements

### `summaries`

Purpose:

- stores summary headers per file, fingerprint, and mode

Main fields:

- `id`
- `fileId`
- `extractedDocumentId`
- `sourceFingerprint`
- `mode`
- `overview`
- `createdAt`
- `updatedAt`

### `summarySections`

Purpose:

- stores sectioned summary output separately from the summary header

Main fields:

- `id`
- `summaryId`
- `sectionKey`
- `order`
- `content`
- `createdAt`
- `updatedAt`

### `summaryConcepts`

Purpose:

- stores extracted concept artifacts tied to a summary

Main fields:

- `id`
- `summaryId`
- `term`
- `score`
- `occurrences`
- `createdAt`
- `updatedAt`

## Phase 3 Quiz Tables

### `quizzes`

Purpose:

- stores generated quiz headers per file and fingerprint

Main fields:

- `id`
- `sourceFileId`
- `extractedDocumentId`
- `sourceFingerprint`
- `title`
- `mode`
- `focusMode`
- `includeExplanations`
- `questionCount`
- `createdAt`
- `updatedAt`

### `quizQuestions`

Purpose:

- stores persisted generated questions

Main fields:

- `id`
- `quizId`
- `type`
- `prompt`
- `choices`
- `correctAnswer`
- `explanation`
- `sourceHint`
- `focusTag`
- `order`
- `createdAt`
- `updatedAt`

### `quizAttempts`

Purpose:

- stores quiz sessions and aggregate results

Main fields:

- `id`
- `quizId`
- `startedAt`
- `completedAt`
- `score`
- `totalQuestions`
- `correctCount`
- `incorrectCount`
- `mode`
- `createdAt`
- `updatedAt`

### `quizAnswers`

Purpose:

- stores per-question answers for an attempt

Main fields:

- `id`
- `attemptId`
- `questionId`
- `answer`
- `isCorrect`
- `evaluatedAt`
- `createdAt`
- `updatedAt`

## Relationships

- one `course` can relate to many `files`
- one `course` can relate to many `events`
- one `file` has one active blob record and can have many extracted documents
- one `file` can have many `summaries`
- one `file` can have many `quizzes`
- one `summary` can have many `summarySections` and `summaryConcepts`
- one `quiz` can have many `quizQuestions`
- one `quiz` can have many `quizAttempts`
- one `quizAttempt` can have many `quizAnswers`
- one `event` can have many `reminders`
- one `reminder` can lead to many `notifications`

## Versioning and Stale Detection

The key versioning rule is fingerprint-based, not timestamp-only:

- source files carry a `contentFingerprint`
- summaries store the fingerprint used during generation
- quizzes store the fingerprint used during generation
- a summary or quiz becomes stale when its stored fingerprint no longer matches the current file fingerprint

This keeps metadata-only edits from invalidating derived study artifacts.

## Phase 4 Hardening Note

Phase 4 did not add new entities. It hardened the trustworthiness of the existing model through:

- stronger tests around persistence and stale flows
- clearer startup and verification paths
- better docs for the actual schema and relationships
