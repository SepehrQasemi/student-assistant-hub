# Student Assistant Hub

Student Assistant Hub is an offline-first student workspace for managing courses, academic files, deadlines, calendar events, reminders, document summaries, and local study quizzes in one place.

Phase 1 delivered the local workspace foundation. Phase 2 added local document extraction and summarization. Phase 3 now adds deterministic local quiz generation, execution, scoring, review, history, and stale-quiz detection without introducing any cloud service, remote AI API, or paid dependency.

## Product Vision

Students often split their academic workflow across folders, calendars, reminders, notes apps, and disconnected study tools. Student Assistant Hub brings those responsibilities into one privacy-friendly workspace and then layers document understanding and active recall workflows on top of the same local file context.

The product roadmap is:

- Phase 1: offline-first workspace, file manager, calendar, reminders, dashboard, settings
- Phase 2: local document processing and summarization for supported files
- Phase 3: local quiz generation, execution, scoring, review, and history
- Phase 4: extended study workflow built on persisted summaries and quiz artifacts

## Current Scope

The repository now contains:

- bilingual English and French UI
- local IndexedDB persistence through Dexie
- courses CRUD
- offline file workspace with local blob storage and realistic previews
- calendar with day, week, month, quarter, and agenda views
- reminders and in-app notification center
- dashboard and settings
- local document extraction for plain text, markdown, and text-based PDFs
- local text normalization, chunking, deterministic summarization, and concept extraction
- summary history and stale summary detection
- local quiz generation from extracted file content
- quiz execution, scoring, per-question review, retry, and history
- stale quiz detection when a file source changes
- automated unit, component, repository, and end-to-end tests

## Phase 3 Summary

Phase 3 is intentionally not a chat or cloud AI phase. It focuses on local study quizzes that reuse the Phase 2 pipeline.

Implemented Phase 3 capabilities:

- derive quiz candidates from extracted text, headings, summary sections, and key concepts
- generate deterministic quizzes for one source file at a time
- support three quiz modes:
  - `multiple_choice`
  - `true_false`
  - `mixed`
- support quiz focus modes:
  - `balanced`
  - `key_concepts`
  - `review`
- persist quizzes, questions, attempts, and answers locally
- score attempts and show per-question correctness
- store explanations when quiz generation options include them
- revisit quiz history by file
- revisit prior attempts and review results later
- detect stale quizzes when the source file fingerprint changes

Short-answer support is intentionally deferred in Phase 3 because the current local-only evaluation boundary is not strong enough to claim robust grading.

## Supported Inputs For Quiz Generation

Quiz generation depends on the existing Phase 2 extraction pipeline. In practice, that means quiz generation currently works for files that can already be processed locally:

- plain text files
- markdown files
- text-based PDFs

Explicitly not supported:

- scanned or image-only PDFs that require OCR
- images as quiz sources
- audio or video
- remote or cloud quiz generation
- fake support for formats that cannot be parsed reliably in the browser
- essay-style or free-form grading

## Architecture Direction

The application is built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture
- Dexie for IndexedDB persistence
- React Hook Form + Zod
- FullCalendar for calendar rendering
- `pdfjs-dist` for local text extraction from text-based PDFs
- deterministic local summarization services built on extraction, normalization, chunking, and concept scoring
- deterministic local quiz-generation services built on extracted text, concept artifacts, and source fingerprints
- Vitest and Testing Library for automated tests
- Playwright for end-to-end verification where feasible

The codebase is separated into:

- `app/` for routes and page composition
- `components/` for reusable UI and feature components
- `lib/db/` for Dexie schema and initialization
- `lib/repositories/` for persistence-facing data access
- `lib/services/` for document ingestion, summarization, quiz generation, scoring, reminders, dashboard logic, and notification workflows
- `lib/i18n/` for bilingual translation infrastructure
- `types/` for domain entities and derived study artifacts

## Browser and Runtime Constraints

Student Assistant Hub remains honest about web platform limits:

- IndexedDB storage quotas depend on the browser
- browser notifications are helpful but not guaranteed when the app is closed
- PDF extraction only works for text-based PDFs
- scanned PDFs and image-only documents are not treated as supported study inputs
- summaries and quizzes are deterministic local heuristics, not cloud-grade language-model reasoning
- short-answer grading is intentionally deferred instead of being faked

## Project Structure

```text
app/                Next.js routes and layouts
components/         UI building blocks and feature components
docs/               product, architecture, QA, and implementation reports
lib/db/             Dexie schema and local database utilities
lib/i18n/           translation dictionaries and i18n helpers
lib/repositories/   local persistence repositories
lib/services/       document, summary, quiz, dashboard, reminder, and notification services
lib/validation/     Zod schemas and form validation factories
tests/              unit, component, repository, and end-to-end tests
types/              shared TypeScript domain types
```

## Documentation Index

- [Product Specification](docs/spec.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [User Flows](docs/user-flows.md)
- [UI Pages](docs/ui-pages.md)
- [Setup Guide](docs/setup.md)
- [Phase 1 Implementation Report](docs/phase1-implementation-report.md)
- [Phase 2 Implementation Report](docs/phase2-implementation-report.md)
- [Phase 3 Implementation Report](docs/phase3-implementation-report.md)

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Verification:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## Status

This repository contains the offline-first Phase 1 application, the Phase 2 local document-processing foundation, and the Phase 3 local quiz workflow. Future phases should reuse extracted text, chunks, concepts, summaries, quizzes, and attempt history rather than replacing the local-first architecture.
