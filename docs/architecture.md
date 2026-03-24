# Architecture Direction

## Primary Architecture

Student Assistant Hub remains a fully local, offline-first web application. It runs entirely in the browser and stores primary data in IndexedDB through Dexie.

There is still no backend in Phase 3.

## Main Libraries

- Next.js App Router for routing and UI composition
- TypeScript for typed domain and persistence contracts
- Tailwind CSS for styling
- shadcn/ui-style component architecture for reusable UI primitives
- Dexie for IndexedDB access and schema versioning
- React Hook Form + Zod for forms and validation
- FullCalendar for calendar rendering across required views
- Notifications API for browser-level notifications where supported
- `pdfjs-dist` for local text extraction from text-based PDFs
- Vitest and Testing Library for automated tests
- Playwright for end-to-end coverage where feasible

Phase 3 does not add a new external quiz-generation dependency. It reuses the existing Phase 2 pipeline and adds deterministic local services for question generation and review.

## Architectural Layers

### UI / Pages / Components

Responsibilities:

- page layout and route composition
- feature presentation
- form interaction
- empty, loading, success, and error states
- responsive behavior

Rules:

- UI must not directly read or write IndexedDB
- UI must not contain extraction, summary, or quiz-generation logic beyond orchestration calls
- user-facing text must go through the i18n layer

### Application Logic / Services

Responsibilities:

- feature orchestration
- dashboard aggregation
- file filtering and sorting rules
- reminder scheduling logic
- notification workflows
- document ingestion and extraction workflows
- normalization, chunking, summarization, and concept extraction
- quiz source selection
- question candidate selection
- deterministic question generation
- answer normalization and quiz evaluation
- stale summary and stale quiz evaluation

### Repository Layer

Responsibilities:

- CRUD access to courses, files, tags, events, reminders, notifications, settings, extracted documents, summaries, summary sections, summary concepts, quizzes, quiz questions, quiz attempts, and quiz answers
- ownership of persistence-specific details
- stable interfaces for future sync or export adapters

### Local Persistence Layer

Responsibilities:

- Dexie database definition
- schema versioning and migrations
- table initialization
- IndexedDB access utilities

### i18n Layer

Responsibilities:

- locale dictionaries
- translation lookup
- runtime locale switching
- persistence of the selected language
- localization of Phase 2 and Phase 3 states, labels, warnings, and review UI

### Reminder Scheduling / Notification Engine

Responsibilities:

- evaluating due reminders
- creating in-app notifications
- requesting browser notification permission
- sending browser notifications only when supported and allowed

### Document Ingestion / Extraction Layer

Responsibilities:

- supported-file detection
- extraction-strategy selection
- text extraction from local blobs
- extraction status tracking
- persistence of raw and normalized text

### Summarization Layer

Responsibilities:

- deterministic chunking for long documents
- sentence and paragraph scoring
- section-aware summary generation
- key concept extraction
- summary and concept persistence orchestration
- stale summary detection using file fingerprints

### Quiz Generation Layer

Responsibilities:

- choosing the strongest quiz source material from extracted documents and summary artifacts
- selecting candidate facts, definitions, and concept statements
- generating multiple-choice and true/false questions deterministically
- generating plausible distractors for MCQs
- attaching explanations and source hints where appropriate
- refusing generation when extracted content is missing, unsupported, or too weak

### Scoring / Review Layer

Responsibilities:

- starting attempts
- normalizing and evaluating answers
- calculating correct counts, incorrect counts, and score percentages
- retrieving review data for attempts
- exposing quiz history and stale quiz state

## High-Level Data Flow

1. A user opens a file and triggers quiz generation from the file workflow.
2. The UI calls a document-quiz service rather than touching Dexie directly.
3. The quiz source service loads current extracted content and supporting summary artifacts for the same file fingerprint.
4. Candidate selection chooses strong concepts and definition-like statements from the source material.
5. The quiz generator builds deterministic multiple-choice or true/false questions and explanations.
6. Repositories store the quiz header and question rows.
7. A dedicated quiz route runs attempts, stores answers, calculates scores, and renders review history.
8. The quiz review service compares quiz fingerprints against the current file fingerprint to mark stale quizzes honestly.

## Local-First Design Principles

- store source files, extracted text, summaries, quizzes, and attempts as separate additive artifacts
- keep entity IDs stable using `crypto.randomUUID()`
- use file-content fingerprints rather than UI assumptions for stale detection
- isolate browser APIs and format-specific parsing behind services
- keep generation and evaluation deterministic enough for repeatable testing

## Phase Reuse Strategy

Phase 3 reuses, not replaces, the Phase 2 foundation:

- extracted text remains the canonical local source material
- chunking and concept extraction remain reusable across later features
- summary sections and concepts help quiz candidate selection
- quiz history is tied to the same file fingerprint model used for stale summaries

Phase 4 should build on persisted quiz artifacts, attempt history, and review signals rather than bypassing them.

## Browser Limitation Policy

The implementation remains honest:

- IndexedDB availability depends on the browser context
- notification delivery cannot be guaranteed when the app is not running
- PDF extraction only supports text-based PDFs
- scanned or image-only PDFs are reported as unsupported study inputs
- quizzes are heuristic and deterministic, not cloud-model reasoning
- short-answer grading is deferred instead of being faked
