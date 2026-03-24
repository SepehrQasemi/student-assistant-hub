# Student Assistant Hub

Student Assistant Hub is an offline-first student workspace for managing courses, academic files, calendar events, reminders, and study organization in one place.

Phase 1 delivered the local workspace foundation. Phase 2 adds local document extraction and summarization for supported files without introducing any cloud service, remote inference, or paid API dependency.

## Product Vision

Students often split their academic workflow across folders, calendars, reminders, and notes tools that do not share context. Student Assistant Hub brings those responsibilities into one privacy-friendly workspace and now starts building local document understanding on top of the existing file manager.

The product roadmap remains:

- Phase 1: offline-first workspace, file manager, calendar, reminders, dashboard, settings
- Phase 2: local document processing and summarization for supported files
- Phase 3: quiz generation built on extracted text, chunks, and concept artifacts
- Phase 4: quiz interaction and extended study workflow

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
- local text normalization, chunking, and deterministic summarization
- summary history and stale summary detection
- automated unit, component, repository, and end-to-end tests

## Phase 2 Summary

Phase 2 is intentionally not a general AI phase. It focuses on local document understanding that is useful, testable, and honest about browser limits.

Implemented Phase 2 capabilities:

- detect supported file types for summarization
- extract text locally where feasible
- normalize extracted text for reuse
- chunk long documents deterministically
- generate four local summary modes:
  - `quick_summary`
  - `structured_summary`
  - `study_notes`
  - `key_concepts`
- persist extracted documents, summaries, sections, and concept artifacts locally
- revisit summary history by file
- detect stale summaries when a file source changes

## Supported Formats

Supported in Phase 2:

- plain text files
- markdown files
- text-based PDFs

Explicitly not supported in Phase 2:

- scanned or image-only PDFs that require OCR
- images as summarization inputs
- audio or video
- remote or cloud summarization
- fake support for formats that cannot be parsed reliably in the browser

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
- Vitest and Testing Library for automated tests
- Playwright for end-to-end verification where feasible

The codebase is separated into:

- `app/` for routes and page composition
- `components/` for reusable UI and feature components
- `lib/db/` for Dexie schema and initialization
- `lib/repositories/` for persistence-facing data access
- `lib/services/` for document ingestion, summarization, reminders, dashboard logic, and notification workflows
- `lib/i18n/` for bilingual translation infrastructure
- `types/` for domain entities and summary artifacts

## Browser and Runtime Constraints

Student Assistant Hub remains honest about web platform limits:

- IndexedDB storage quotas depend on the browser
- browser notifications are helpful but not guaranteed when the app is closed
- PDF extraction only works for text-based PDFs
- scanned PDFs and image-only documents are not treated as supported summary inputs
- summaries are local deterministic summaries, not cloud-grade language-model reasoning

## Project Structure

```text
app/                Next.js routes and layouts
components/         UI building blocks and feature components
docs/               product, architecture, QA, and implementation reports
lib/db/             Dexie schema and local database utilities
lib/i18n/           translation dictionaries and i18n helpers
lib/repositories/   local persistence repositories
lib/services/       document, summary, dashboard, reminder, and notification services
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

This repository contains the offline-first Phase 1 application and the Phase 2 local document-processing foundation. Future phases should reuse extracted text, chunks, concepts, and summary artifacts rather than replacing the local-first architecture.
