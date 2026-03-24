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

### Rationale

Before quiz generation exists, the product needs reusable extracted text and summary artifacts that stay local, testable, and bounded by honest browser behavior.

## Phase 3: Quiz Generation

### Goal

Turn extracted text, summary sections, and concept artifacts into local study questions.

### Scope

- question generation from extracted text and summaries
- local quiz artifact persistence
- quiz creation controls linked to files
- reuse of Phase 2 chunking and concept infrastructure

### Rationale

Quiz generation should build on a stable document-processing pipeline rather than bypass it.

## Phase 4: Quiz Interaction and Extended Study Workflow

### Goal

Extend the workspace from content preparation into active study sessions.

### Scope

- quiz interaction workflows
- answer review and iteration loops
- richer study-session navigation
- longer-term study workflow extensions

## Rationale for Ordering

1. The offline workspace had to be stable before document processing was added.
2. Document extraction and summarization are prerequisites for reuse in quiz generation.
3. Quiz interaction should come only after the product can produce durable study artifacts locally.
