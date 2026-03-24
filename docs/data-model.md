# Local Data Model

## Overview

Student Assistant Hub stores Phase 1, Phase 2, and Phase 3 data locally in IndexedDB through Dexie. The schema remains versioned so the application can evolve without collapsing into ad hoc persistence.

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

Short-answer is intentionally deferred in Phase 3 and is therefore not represented as an active stored question type.

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

Stores local file metadata separately from raw blobs and carries source fingerprint data for stale detection.

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
- one file can have many quizzes

### Notes and Constraints

- `contentFingerprint` changes only when the source content changes
- metadata-only edits must not invalidate summaries or quizzes

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

Stores the result of attempting to extract text from a file for Phase 2 and Phase 3 processing.

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
- one extracted-document record can be referenced by many summaries and many quizzes created from the same source fingerprint

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

## Table: quizzes

### Purpose

Stores generated quiz headers tied to a file and a specific extracted-document fingerprint.

### Main Fields

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

### Relationships

- many quizzes can belong to one file
- many quizzes can reference one extracted-document artifact
- one quiz can have many quiz questions
- one quiz can have many quiz attempts

### Notes and Constraints

- quizzes are matched against `sourceFingerprint` for stale detection
- generation options are stored on the quiz so history remains explainable
- duplicate current quizzes can be avoided by matching file, fingerprint, and generation options

## Table: quizQuestions

### Purpose

Stores persisted generated questions for each quiz.

### Main Fields

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

### Relationships

- many quiz questions belong to one quiz
- one quiz question can have many quiz answers across attempts

### Notes and Constraints

- `type` is currently limited to `multiple_choice` and `true_false`
- explanations are persisted so review stays stable even after the generation UI closes
- `focusTag` keeps track of whether a question was generated from balanced, concept-heavy, or review-oriented logic

## Table: quizAttempts

### Purpose

Stores user quiz-taking sessions and their aggregate results.

### Main Fields

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

### Relationships

- many attempts belong to one quiz
- one attempt can have many quiz answers

### Notes and Constraints

- an attempt is created when the user starts a quiz
- aggregate counts are stored for fast history rendering
- `score` remains `null` until the attempt is submitted

## Table: quizAnswers

### Purpose

Stores per-question answers and correctness for a specific attempt.

### Main Fields

- `id`
- `attemptId`
- `questionId`
- `answer`
- `isCorrect`
- `evaluatedAt`
- `createdAt`
- `updatedAt`

### Relationships

- many answers belong to one attempt
- many answers can reference the same quiz question across retries

### Notes and Constraints

- answers are normalized before evaluation
- persisted review uses the stored answer rows rather than recalculating from volatile UI state

## Future Extension Notes

The Phase 3 model is designed so later phases can build on it:

- quiz review can reuse source hints and explanations without regenerating questions
- future study workflows can reference attempt history and stale state
- export or sync can treat extracted documents, summaries, quizzes, and attempts as additive local artifacts
