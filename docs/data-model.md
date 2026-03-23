# Data Model Proposal

## Overview

The Phase 1 data model centers on a single-user academic workspace. Every domain record should be scoped to the authenticated user through `user_id` ownership and protected by row-level security.

Future AI tables should extend the model without changing the ownership and relationship rules of the core entities.

## Controlled Values

### File Categories

Proposed controlled values:

- `lecture_notes`
- `assignment`
- `exam_material`
- `project`
- `reading`
- `administrative`
- `other`

### Event Types

Proposed controlled values:

- `class_session`
- `assignment_deadline`
- `exam`
- `study_session`
- `meeting`
- `personal`
- `other`

## Entity: profiles

### Purpose

Stores application-specific user profile data linked to the authentication system.

### Main Fields

- `id` UUID, primary key, matches Supabase Auth user ID
- `display_name` text
- `timezone` text
- `avatar_url` text, nullable
- `default_calendar_view` text, nullable
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- one profile belongs to one authenticated user
- one profile owns many courses
- one profile owns many files
- one profile owns many events
- one profile owns many reminders

### Notes and Constraints

- the profile record should be created automatically on first authenticated sign-in or signup completion
- `timezone` should default to a sensible value and be user-editable
- email should remain sourced from auth unless there is a strong reason to duplicate it

## Entity: courses

### Purpose

Represents a course, module, or subject in the student workspace.

### Main Fields

- `id` UUID, primary key
- `user_id` UUID, foreign key to profiles.id
- `name` text
- `code` text, nullable
- `term` text, nullable
- `color` text, nullable
- `description` text, nullable
- `is_archived` boolean
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- many courses belong to one profile
- one course can have many files
- one course can have many events

### Notes and Constraints

- `name` is required
- `code` is optional because not all students manage standardized course codes
- a unique constraint on `(user_id, name)` is reasonable if duplicate names create confusion
- archiving is preferable to hard deletion once related files or events exist

## Entity: files

### Purpose

Stores metadata for academic files uploaded by the user.

### Main Fields

- `id` UUID, primary key
- `user_id` UUID, foreign key to profiles.id
- `course_id` UUID, nullable foreign key to courses.id
- `title` text
- `original_filename` text
- `storage_path` text
- `bucket_name` text
- `mime_type` text
- `size_bytes` bigint
- `category` text
- `description` text, nullable
- `uploaded_at` timestamp
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- many files belong to one profile
- many files can belong to one course
- one file can later have many summaries
- one file can later be a source for many quizzes

### Notes and Constraints

- `storage_path` should be unique per object
- `category` should use the controlled values defined above
- `course_id` can be nullable to allow inbox-style uploads before classification
- file metadata deletion must be coordinated with storage object deletion to avoid orphaned objects

## Entity: events

### Purpose

Represents scheduled academic activity such as deadlines, exams, classes, or study sessions.

### Main Fields

- `id` UUID, primary key
- `user_id` UUID, foreign key to profiles.id
- `course_id` UUID, nullable foreign key to courses.id
- `title` text
- `description` text, nullable
- `event_type` text
- `starts_at` timestamp
- `ends_at` timestamp, nullable
- `all_day` boolean
- `timezone` text
- `location` text, nullable
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- many events belong to one profile
- many events can belong to one course
- one event can have many reminders

### Notes and Constraints

- `title`, `event_type`, and `starts_at` are required
- `event_type` should use the controlled values defined above
- if `ends_at` is present, it must be greater than or equal to `starts_at`
- a course link is optional because some events may be cross-course or personal planning items

## Entity: reminders

### Purpose

Stores reminder configuration attached to an event.

### Main Fields

- `id` UUID, primary key
- `user_id` UUID, foreign key to profiles.id
- `event_id` UUID, foreign key to events.id
- `offset_minutes` integer
- `scheduled_for` timestamp, nullable
- `channel` text
- `is_enabled` boolean
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- many reminders belong to one profile
- many reminders belong to one event

### Notes and Constraints

- Phase 1 should support at least relative timing through `offset_minutes`
- `channel` can default to `in_app` in Phase 1 even if delivery is not yet fully automated
- `scheduled_for` may be computed and cached later if a delivery engine is introduced
- reminders should not exist without a valid parent event

## Future Entity: summaries

### Purpose

Stores AI-generated summaries derived from academic files in Phase 2.

### Main Fields

- `id` UUID, primary key
- `user_id` UUID
- `file_id` UUID, foreign key to files.id
- `status` text
- `summary_text` text, nullable
- `model_name` text, nullable
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- many summaries belong to one profile
- many summaries belong to one file

### Notes and Constraints

- summaries are generated artifacts and should never replace the source file metadata
- status should support pending, succeeded, and failed states

## Future Entity: quizzes

### Purpose

Stores generated quiz sets for later study interaction.

### Main Fields

- `id` UUID, primary key
- `user_id` UUID
- `course_id` UUID, nullable
- `source_file_id` UUID, nullable
- `source_summary_id` UUID, nullable
- `title` text
- `status` text
- `created_at` timestamp
- `updated_at` timestamp

### Relationships

- many quizzes belong to one profile
- a quiz may relate to one course
- a quiz may derive from one file or one summary
- one quiz has many quiz questions

### Notes and Constraints

- quizzes should preserve traceability to the material they were generated from
- source references should be additive rather than overloading file records

## Future Entity: quiz_questions

### Purpose

Stores individual questions that belong to a generated quiz.

### Main Fields

- `id` UUID, primary key
- `quiz_id` UUID, foreign key to quizzes.id
- `question_text` text
- `question_type` text
- `answer_options` JSONB, nullable
- `correct_answer` JSONB, nullable
- `explanation` text, nullable
- `position` integer
- `created_at` timestamp

### Relationships

- many quiz questions belong to one quiz

### Notes and Constraints

- `position` should keep questions in a stable order
- JSONB fields provide flexibility for multiple-choice and short-answer formats
- question storage should be independent from user quiz attempt history if that is added later
