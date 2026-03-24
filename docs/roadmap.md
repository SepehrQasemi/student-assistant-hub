# Product Roadmap

## Roadmap Overview

The roadmap follows a local-first strategy. The product must become a trustworthy offline workspace before any optional sync or broader AI-assisted study features are introduced.

## Phase 1: Offline-First Core Workspace

### Goal

Deliver a fully usable local workspace for student organization with no backend requirement.

### Scope

- bilingual English and French UI
- local Dexie persistence
- courses CRUD
- offline file manager with previews
- local calendar with multiple views
- reminders and notification center
- dashboard
- settings
- automated tests and responsive UX

## Phase 2: Local Document Processing and Summarization

### Goal

Add a real local document-understanding layer for supported files without cloud inference.

### Scope

- file type detection for supported summarization inputs
- local extraction for plain text, markdown, and text-based PDFs
- extraction state tracking and persistence
- text normalization and deterministic chunking
- local summary generation for:
  - `quick_summary`
  - `structured_summary`
  - `study_notes`
  - `key_concepts`
- concept extraction and persistence
- summary history by file
- stale summary detection using source fingerprints
- UI integration inside the file workflow
- test coverage for repositories, services, UI, and summary persistence

### Milestones

- M1: update docs and extend the local data model
- M2: implement ingestion, extraction, and extraction persistence
- M3: implement normalization, chunking, concept extraction, and summarization services
- M4: implement summary persistence, history, and stale detection
- M5: integrate summaries into the file UX and complete bilingual states
- M6: QA, tests, and Phase 2 implementation report

## Phase 3: Local Quiz Generation, Execution, and Review

### Goal

Turn extracted text, summaries, and concept artifacts into local study quizzes that can be taken, scored, reviewed, and revisited later.

### Scope

- question source selection from extracted text and summary artifacts
- deterministic local quiz generation for one file at a time
- supported question types:
  - `multiple_choice`
  - `true_false`
- supported quiz modes:
  - `multiple_choice`
  - `true_false`
  - `mixed`
- quiz generation options:
  - question count
  - mode
  - focus mode
  - include explanations
- quiz persistence
- question persistence
- attempt persistence
- answer persistence
- score calculation and per-question review
- quiz history by file
- stale quiz detection using source fingerprints
- bilingual UI integration for quiz creation, play, review, and history
- tests for services, repositories, UI, and end-to-end quiz flows

### Milestones

- M1: update docs and extend the local data model for quizzes
- M2: implement quiz source selection, candidate generation, and distractor logic
- M3: implement question generation for multiple-choice and true/false
- M4: implement quiz, question, attempt, and answer persistence
- M5: implement quiz player, review route, history, and stale warnings
- M6: complete bilingual coverage, tests, QA, and Phase 3 implementation report

### Rationale

Quiz generation should build on a stable document-processing pipeline rather than bypass it. Reusing extracted text, chunks, summaries, and concepts keeps the study workflow local, explainable, and testable.

## Phase 4: Extended Study Workflow

### Goal

Extend the workspace from local quiz review into broader study-session workflows without abandoning the offline-first architecture.

### Candidate Scope

- deeper review prioritization based on prior attempts
- richer transitions between summaries, quizzes, and calendar deadlines
- more deliberate study-session orchestration around existing local artifacts
- export or portability improvements for local study data

### Rationale

Phase 4 should build on persisted summaries, quizzes, and attempt history instead of replacing them with a separate platform.

## Rationale for Ordering

1. The offline workspace had to be stable before document processing was added.
2. Document extraction and summarization were prerequisites for grounded quiz generation.
3. Quiz generation, execution, and review needed durable local artifacts before broader study orchestration could be added.
