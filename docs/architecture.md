# Architecture Direction

## Primary Architecture

Student Assistant Hub remains a fully local, offline-first web application. It runs entirely in the browser and stores primary data in IndexedDB through Dexie.

There is still no backend in Phase 2.

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
- UI must not contain extraction or summarization logic beyond orchestration calls
- user-facing text must go through the i18n layer

### Application Logic / Services

Responsibilities:

- feature orchestration
- dashboard aggregation
- file filtering and sorting rules
- reminder scheduling logic
- notification workflows
- document ingestion and extraction workflows
- normalization, chunking, and summarization
- stale summary evaluation

### Repository Layer

Responsibilities:

- CRUD access to courses, files, tags, events, reminders, notifications, settings, extracted documents, summaries, summary sections, and concept artifacts
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
- localization of Phase 2 states, labels, warnings, and summary-mode UI

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

## High-Level Data Flow

1. A user opens a file and triggers summary generation from the file workflow.
2. The UI calls a document-summary service rather than touching Dexie directly.
3. The ingestion layer resolves the file type and extraction strategy.
4. The extraction result is persisted as an extracted-document artifact with an explicit status.
5. The summarization layer normalizes text, creates chunks, scores content, and generates summary artifacts.
6. Repositories store the summary record, section records, and concept artifacts.
7. The UI reads summary history and stale state through repository-backed queries.

## Local-First Design Principles

- store source files, extracted text, and derived summary artifacts separately
- keep entity IDs stable using `crypto.randomUUID()`
- use file-content fingerprints rather than UI assumptions for stale detection
- keep derived artifacts additive so later phases can reuse them
- isolate browser APIs and format-specific parsing behind services

## Phase 2 Reuse Strategy

Phase 3 should reuse, not replace, the Phase 2 foundation. That means:

- extracted text is persisted and queryable by file
- chunking is deterministic and reusable
- summary sections and concept artifacts are stored independently from rendering concerns
- stale detection is based on source fingerprints, not fragile timestamps alone

## Browser Limitation Policy

The implementation remains honest:

- IndexedDB availability depends on the browser context
- notification delivery cannot be guaranteed when the app is not running
- PDF extraction only supports text-based PDFs
- scanned or image-only PDFs are reported as unsupported or failed extraction inputs
- local summaries are heuristic and deterministic, not cloud-model reasoning
