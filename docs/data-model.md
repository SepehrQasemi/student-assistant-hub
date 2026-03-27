# Local Data Model

## Overview

Student Assistant Hub stores product data locally in IndexedDB through Dexie.

The current model covers:

- course management
- nested workspace folders for courses and My Drive
- local file storage
- import review state
- confirmed document assignments
- extracted text and embeddings
- summaries
- quizzes
- calendar, reminders, and notifications

Every primary persisted entity uses stable IDs and timestamps. Derived study artifacts are stored separately from source file records so history and stale detection remain explicit.

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
- `docx`
- `pptx`
- `unsupported`

### Extraction Statuses

- `pending`
- `success`
- `failed`
- `unsupported`
- `empty`

### Import Batch Source Types

- `files`
- `folder`

### Import Batch Statuses

- `draft`
- `suggested`
- `needs_review`
- `confirmed`

### Import Batch Item Statuses

- `suggested`
- `needs_review`
- `unknown`
- `confirmed`

### Assignment Provenance

- `manual_upload`
- `manual_update`
- `import_confirmation`

### Embedding Purposes

- `course_profile`
- `document_assignment`

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

### Quiz Source Scopes

- `file`
- `course`

## Core Workspace Tables

### `courses`

Purpose:

- stores the course structure used by files and events

Main fields:

- `id`
- `name`
- `description`
- `code`
- `instructor`
- `semester`
- `color`
- `notes`
- `createdAt`
- `updatedAt`
- `deletedAt`

### `courseFolders`

Purpose:

- stores nested folders for either a course workspace or My Drive

Main fields:

- `id`
- `courseId`
- `parentFolderId`
- `name`
- `path`
- `createdAt`
- `updatedAt`
- `deletedAt`

Notes:

- `courseId = null` means the folder belongs to My Drive
- `path` is the canonical in-scope folder path used for restore and relative-path mapping

### `files`

Purpose:

- stores local file metadata and current source version information

Main fields:

- `id`
- `name`
- `originalName`
- `courseId`
- `folderId`
- `category`
- `mimeType`
- `extension`
- `sizeBytes`
- `notes`
- `tagIds`
- `blobId`
- `importBatchId`
- `originalRelativePath`
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
- `courseId === null` means the file currently lives in the general drive
- `folderId` is meaningful for both course folders and drive folders
- `courseId` and `folderId` remain nullable until confirmation in the smart import flow
- `deletedAt` marks when the file entered Trash and is reused for restore / permanent delete flows

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

### `quizzes`

Purpose:

- stores quiz headers for file-level and course-level quizzes

Main fields:

- `id`
- `sourceScope`
- `sourceFileId`
- `sourceCourseId`
- `sourceFingerprint`
- `title`
- `mode`
- `focusMode`
- `includeExplanations`
- `questionCount`
- `createdAt`
- `updatedAt`

Notes:

- file quizzes keep `sourceScope = file` and `sourceFileId`
- course quizzes keep `sourceScope = course` and `sourceCourseId`
- `sourceFingerprint` is a combined fingerprint for the saved source set and its weights

### `quizSources`

Purpose:

- stores the normalized file list behind one quiz together with each file's weight

Main fields:

- `id`
- `quizId`
- `fileId`
- `extractedDocumentId`
- `sourceFingerprint`
- `weight`
- `order`
- `createdAt`
- `updatedAt`

Notes:

- single-file quizzes still get one `quizSources` row
- course quizzes store one row per included file
- stale detection compares current file fingerprints against these stored source links

### `documentAssignments`

Purpose:

- stores the confirmed course and optional folder assignment for a file

Main fields:

- `id`
- `documentId`
- `courseId`
- `folderId`
- `provenance`
- `confirmedAt`
- `createdAt`
- `updatedAt`

Notes:

- this is the durable assignment record
- smart import suggestions do not become final assignments until confirmation writes this table
- drive-level files do not keep a document assignment record

### `importBatches`

Purpose:

- stores one smart import session

Main fields:

- `id`
- `sourceType`
- `status`
- `createdAt`
- `updatedAt`

### `importBatchItems`

Purpose:

- stores per-file review state for one import batch

Main fields:

- `id`
- `batchId`
- `documentId`
- `originalRelativePath`
- `folderGroupPath`
- `suggestedCourseId`
- `secondBestCourseId`
- `confidence`
- `bestScore`
- `secondBestScore`
- `status`
- `reason`
- `finalCourseId`
- `finalFolderId`
- `ranking`
- `createdAt`
- `updatedAt`

Notes:

- ranking is persisted so the review UI can explain the suggestion without recomputing immediately
- `finalCourseId` and `finalFolderId` remain unset until user confirmation unless the user confirms the suggested value

### `tags`

Purpose:

- supports optional file tagging

### `events`

Purpose:

- stores local calendar events

### `reminders`

Purpose:

- stores reminder scheduling for events

### `notifications`

Purpose:

- stores in-app notification records

### `settings`

Purpose:

- stores local preferences and capability state

## Document and AI Tables

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

### `courseProfiles`

Purpose:

- stores semantic course profiles derived from course metadata plus confirmed course documents

Main fields:

- `id`
- `courseId`
- `embeddingModel`
- `sourceFingerprint`
- `profileText`
- `keywords`
- `embedding`
- `documentCount`
- `createdAt`
- `updatedAt`

Notes:

- profiles are the only valid AI comparison targets for course suggestion
- the system does not classify against invented or open-ended labels

### `documentEmbeddings`

Purpose:

- stores reusable embeddings for assignment representations

Main fields:

- `id`
- `fileId`
- `sourceFingerprint`
- `purpose`
- `embeddingModel`
- `representationText`
- `embedding`
- `createdAt`
- `updatedAt`

## Summary Tables

### `summaries`

Purpose:

- stores summary headers for file-level summaries and any archived course-level study-note artifacts

Main fields:

- `id`
- `sourceScope`
- `fileId`
- `sourceCourseId`
- `extractedDocumentId`
- `sourceFingerprint`
- `mode`
- `title`
- `overview`
- `createdAt`
- `updatedAt`

Notes:

- file summaries keep `sourceScope = file` and `fileId`
- archived course study notes keep `sourceScope = course` and `sourceCourseId`
- `sourceFingerprint` is a combined fingerprint for the saved source set

### `summarySources`

Purpose:

- stores the normalized file list behind one summary

Main fields:

- `id`
- `summaryId`
- `fileId`
- `extractedDocumentId`
- `sourceFingerprint`
- `order`

Notes:

- single-file summaries still get one `summarySources` row
- archived course study notes store one row per included file
- stale detection compares current file fingerprints against these stored source links

### `summarySections`

Purpose:

- stores sectioned summary output separately from the summary header

### `summaryConcepts`

Purpose:

- stores extracted term artifacts tied to a summary

## Quiz Tables

### `quizzes`

Purpose:

- stores generated quiz headers for file-level and course-level quizzes

### `quizQuestions`

Purpose:

- stores persisted generated questions

### `quizAttempts`

Purpose:

- stores quiz sessions and aggregate results

### `quizAnswers`

Purpose:

- stores per-question answers for an attempt

## Relationships

- one `course` can relate to many `courseFolders`
- one `course` can relate to many `files`
- one `course` can relate to many `events`
- one `file` has one active blob record and can have many extracted documents
- one `file` can belong to zero or one active confirmed `documentAssignment`
- one `file` can participate in zero or one `importBatch`
- one `importBatch` can have many `importBatchItems`
- one `summary` can have many `summarySections` and `summaryConcepts`
- one `quiz` can have many `quizQuestions`
- one `quiz` can have many `quizAttempts`
- one `quizAttempt` can have many `quizAnswers`
- one `event` can have many `reminders`
- one `reminder` can lead to many `notifications`

## Versioning and Stale Detection

The key versioning rule remains fingerprint-based, not timestamp-only:

- source files carry a `contentFingerprint`
- extracted documents store the fingerprint used during extraction
- summaries store the fingerprint used during generation
- quizzes store the fingerprint used during generation
- a summary or quiz becomes stale when its stored fingerprint no longer matches the current file fingerprint

This keeps metadata-only edits from invalidating derived study artifacts.
