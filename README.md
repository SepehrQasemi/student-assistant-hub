# Student Assistant Hub

Student Assistant Hub is an offline-first student workspace for managing courses, academic files, calendar events, reminders, local summaries, and local study quizzes in one place.

The project is intentionally browser-local:

- no backend
- no cloud storage
- no remote AI services
- no paid inference APIs

## Current Status

Phases 1 through 4 are implemented.

- Phase 1: offline-first workspace, file manager, calendar, reminders, dashboard, settings
- Phase 2: local document extraction, normalization, chunking, summarization, and concept extraction
- Phase 3: local quiz generation, execution, scoring, review, history, and stale-quiz handling
- Phase 4: hardening pass covering startup scripts, verification tooling, coverage reporting, responsive cleanup, and English/French audit

Phase 4 is a product-quality pass, not a new feature domain. The current repository is the hardened local product foundation.

## Implemented Product Scope

- bilingual English and French UI
- local IndexedDB persistence through Dexie
- courses CRUD
- offline file workspace with blob storage, metadata editing, filters, notes, tags, and realistic previews
- calendar with day, week, month, quarter, and agenda views
- reminders and in-app notification center
- dashboard and settings
- local extraction for plain text, markdown, and text-based PDFs
- deterministic summaries and key concepts
- summary history and stale-summary detection
- deterministic local quiz generation from one file at a time
- quiz history, attempt history, scoring, explanations, and stale-quiz detection
- startup scripts for Windows and Unix-like shells
- `npm run verify`, `npm run verify:full`, and coverage reporting
- unit, integration, component, and end-to-end tests

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Dexie / IndexedDB
- React Hook Form + Zod
- FullCalendar
- `pdfjs-dist`
- Vitest + Testing Library
- Playwright

## Quick Start

### One-click / script-based run

Windows double-click:

- `RUN_ME_WINDOWS.bat`

Windows PowerShell:

```powershell
./RUN_ME_WINDOWS.ps1
```

Unix-like shell:

```bash
bash RUN_ME_UNIX.sh
```

Stop scripts:

- Windows: `./STOP_WINDOWS.ps1`
- Unix-like: `bash STOP_UNIX.sh`

### Standard npm run path

```bash
npm install
npx playwright install
npm run dev
```

## Verification

Primary verification path:

```bash
npm run verify
```

This runs:

- `npm run lint`
- `npm run test`
- `npm run build`

Extended verification:

```bash
npm run verify:full
```

This adds:

- `npm run test:e2e`

Coverage:

```bash
npm run coverage
```

Current global coverage thresholds:

- lines: `72%`
- statements: `72%`
- functions: `72%`
- branches: `62%`

## Supported Study Inputs

Supported for local extraction and downstream study workflows:

- plain text files
- markdown files
- text-based PDFs

Explicitly not supported:

- scanned or image-only PDFs that require OCR
- images as study inputs
- audio or video
- remote summarization
- remote quiz generation
- essay grading

## Honest Runtime Limits

- IndexedDB quota depends on the browser
- browser notifications are best-effort, not native-background guarantees
- preview and extraction support depend on what the browser can safely render or parse
- summaries and quizzes are deterministic local heuristics, not cloud LLM reasoning
- clearing site data removes the local workspace and derived study artifacts

## Project Structure

```text
app/                Next.js routes and layouts
components/         Reusable UI and feature components
docs/               Product docs and implementation reports
lib/db/             Dexie schema and defaults
lib/i18n/           Locale dictionaries and helpers
lib/repositories/   Persistence boundaries
lib/services/       Product logic, reminders, summaries, and quizzes
lib/validation/     Zod validation schemas
scripts/            Verification helpers
tests/              Unit, component, integration, and e2e tests
types/              Shared domain types
```

## Documentation

- [Product Specification](docs/spec.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [User Flows](docs/user-flows.md)
- [UI Pages](docs/ui-pages.md)
- [Setup Guide](docs/setup.md)
- [Phase 1 Report](docs/phase1-implementation-report.md)
- [Phase 2 Report](docs/phase2-implementation-report.md)
- [Phase 3 Report](docs/phase3-implementation-report.md)
- [Phase 4 Hardening Report](docs/phase4-hardening-report.md)

## License

MIT
