# Product Specification

## Product Overview

Student Assistant Hub is an offline-first student workspace for organizing academic life locally in the browser. It helps students manage courses, files, deadlines, exams, reminders, summaries, and study quizzes without relying on a backend service.

Phase 3 extends the existing local workspace and document-understanding layers with local quiz generation, quiz-taking, scoring, review, history, and stale detection. It does not introduce remote AI, cloud inference, or online sync.

## Problem Statement

Students do not just need storage and summaries. They also need active recall.

After Phase 1 and Phase 2, the workspace already solves organization and document recap problems. The next problem is study execution:

- students want to test themselves against course material quickly
- generic online quiz tools break file context and privacy expectations
- cloud quiz generation may be undesirable because of privacy, cost, or offline use
- review needs to stay linked to the exact file version that produced the questions

Phase 3 solves this by adding a realistic, local quiz workflow that is derived from already extracted file content and persisted locally for reuse.

## Target Users

Primary users:

- students managing several courses and many academic files
- students who want private, local-first study tooling
- students preparing for exams with repeated self-testing

Secondary users:

- students revisiting summary artifacts before starting a quiz
- students working in mixed English/French environments

## Primary Use Cases

- open a supported file from the offline file workspace
- generate a quiz from that file using local Phase 2 artifacts
- choose quiz options such as question count, mode, focus, and explanations
- complete the quiz inside the app
- receive a score and per-question review
- revisit prior quizzes and attempts later
- detect whether a stored quiz is stale after the source file changes

## Phase 1 Scope

Phase 1 includes:

- bilingual application UI with English and French dictionaries
- local persistence through IndexedDB
- course CRUD
- offline file manager with local blob storage and realistic previews
- calendar with day, week, month, quarter, and agenda views
- reminders and notification center
- dashboard with useful summaries
- settings for language, notification preferences, and local app behavior
- automated tests and responsive UX

## Phase 2 Scope

Phase 2 includes:

- supported file type detection for summarization
- local extraction for plain text, markdown, and text-based PDFs
- extraction state persistence
- text normalization
- deterministic chunking for long documents
- local summarization modes:
  - `quick_summary`
  - `structured_summary`
  - `study_notes`
  - `key_concepts`
- key concept extraction and persistence
- summary history by file
- stale summary detection using source fingerprints
- bilingual UI coverage for all new Phase 2 states and actions

## Phase 3 Scope

Phase 3 includes:

- quiz generation from one supported source file at a time
- reuse of extracted text, summaries, chunk structure, and concept artifacts
- deterministic local question generation
- multiple-choice questions
- true/false questions
- quiz option controls:
  - question count
  - mode
  - focus mode
  - include explanations
- quiz persistence
- question persistence
- attempt and answer persistence
- scoring and results review
- attempt history and retry flow
- stale quiz detection using source fingerprints
- bilingual UI coverage for all new Phase 3 states and actions
- automated tests for quiz generation, persistence, review, and stale detection

## Out of Scope for Phase 3

Phase 3 does not include:

- OpenAI APIs or any remote inference service
- cloud sync
- OCR for scanned or image-only PDFs
- chat with documents
- flashcards
- spaced repetition
- adaptive tutoring
- multi-file quiz generation
- teacher authoring tools
- essay grading
- short-answer grading

Short-answer is intentionally deferred rather than being shipped with weak local evaluation.

## Success Criteria for Phase 3

Phase 3 is successful when a student can:

- choose a supported file from the file manager
- generate a quiz using deterministic local logic
- select between multiple-choice, true/false, or mixed modes
- complete the quiz inside the app
- see score, correct and incorrect counts, answers, and explanations
- reopen older quizzes and attempts later
- clearly see when a stored quiz is outdated because the source file changed
- switch the UI between English and French without leaving Phase 3 strings untranslated

Engineering-level success criteria:

- quiz logic lives outside page and feature components
- persistence is routed through repositories
- quiz generation reuses Phase 2 artifacts instead of reparsing files through a parallel path
- file fingerprint comparison is deterministic and tested
- unsupported, missing, and insufficient-content states are explicit
- question generation stays grounded in the source file content

## Constraints and Assumptions

### Constraints

- the product must remain offline-first and local-only
- the implementation must remain honest about extraction, browser, and quiz-quality limitations
- user-facing strings must continue to flow through the existing i18n layer
- the file manager remains the central product surface for quiz generation entry

### Assumptions

- the app is still used by one person per browser profile
- local data can still be lost if the user clears site storage
- PDF extraction quality depends on text actually being embedded in the PDF
- quiz quality is deterministic and heuristic, not equivalent to large-model reasoning
- future study workflows should consume persisted quiz artifacts rather than rebuilding the same questions repeatedly
