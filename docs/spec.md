# Product Specification

## Product Overview

Student Assistant Hub is an offline-first student workspace for organizing academic life locally in the browser. It helps students manage courses, files, deadlines, exams, reminders, and weekly planning without relying on a backend service.

Phase 2 extends the Phase 1 workspace with local document extraction and summarization for supported files. It does not introduce remote AI or cloud processing.

## Problem Statement

Students do not just store files; they need to understand and revisit them quickly.

After Phase 1, the workspace already solves organization and planning problems. The next problem is document comprehension:

- lecture notes can be long and unevenly structured
- PDFs and markdown notes often contain useful content that is slow to review manually
- students need a quick recap before class, exams, or revision sessions
- cloud summarization may be undesirable because of privacy, cost, or offline use

Phase 2 solves this by adding a realistic, local summarization layer for supported text-friendly documents.

## Target Users

Primary users:

- students managing several courses and many academic files
- students who want private, local-first study tooling
- students who revisit long notes and PDFs repeatedly

Secondary users:

- students preparing for future Phase 3 quiz workflows
- students working in mixed English/French environments

## Primary Use Cases

- select a file from the offline file workspace
- detect whether the file is supported for extraction
- extract raw text locally where feasible
- normalize the text into a reusable document representation
- generate multiple summary modes for study and review
- extract key concepts from the document text
- persist summaries and revisit them later
- detect whether older summaries are stale after the source file changes

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
- automated tests for extraction, summarization, persistence, UI, and stale detection

## Out of Scope for Phase 2

Phase 2 does not include:

- OpenAI APIs or any remote inference service
- cloud sync
- OCR for scanned or image-only PDFs
- image-based summarization
- DOC or DOCX parsing when reliability is uncertain
- full semantic search
- quiz generation
- flashcards
- chat with documents

## Success Criteria for Phase 2

Phase 2 is successful when a student can:

- choose a supported file from the file manager
- see whether the file is supported, empty, failed, or successfully extracted
- generate one or more local summaries from extracted text
- review structured sections and key concepts
- reopen older summaries later from file history
- clearly see when a stored summary is outdated because the source file changed
- switch the UI between English and French without leaving Phase 2 strings untranslated

Engineering-level success criteria:

- extraction and summarization logic live outside page components
- persistence is routed through repositories
- extracted text and summary artifacts are reusable for future quiz generation
- file fingerprint comparison is deterministic and tested
- unsupported formats and failed extraction states are explicit, not hidden

## Constraints and Assumptions

### Constraints

- the product must remain offline-first and local-only
- the implementation must remain honest about PDF and browser limitations
- user-facing strings must continue to flow through the existing i18n layer
- the file manager remains the central product surface for this phase

### Assumptions

- the app is still used by one person per browser profile
- local data can still be lost if the user clears site storage
- PDF extraction quality depends on text actually being embedded in the PDF
- summary quality is deterministic and heuristic, not equivalent to large-model reasoning
- future quiz generation should consume extracted text and concept artifacts instead of re-parsing files from scratch
