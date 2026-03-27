# Student Assistant Hub

Student Assistant Hub is an offline-first student workspace for managing courses, course folders, academic files, calendar events, reminders, summaries, and study quizzes in one place.

The product remains local-first:

- no remote backend
- no cloud storage
- no sync service
- no paid AI API

The current repository uses IndexedDB for product data and a small set of same-origin Next route handlers only as a bridge to local machine capabilities such as Ollama and browser-blocked calendar fetches.

## Implemented Product Scope

- bilingual English and French UI
- local IndexedDB persistence through Dexie
- course CRUD with optional descriptions
- nested folders inside each course
- dedicated course workspace pages
- manual file upload into a selected course, optional course folder, or the general drive
- bulk mixed-file upload
- folder import with preserved relative paths
- central file manager with an all-files, My Drive, course, and Trash sidebar
- bulk file selection with move-to-trash, restore, and permanent delete actions
- non-destructive trash flow before final deletion
- smart import review flow that suggests an existing course per file before confirmation
- assignment logic that can only choose among existing courses
- no automatic course creation by AI
- no final import assignment without explicit user confirmation
- local extraction for plain text, markdown, text-based PDFs, DOCX, and PPTX
- local Ollama-backed document summaries
- local Ollama-backed quiz generation with persisted quiz history and stale detection
- file-level study notes remain available in each file detail dialog
- course-level multi-file study notes are intentionally archived from the current UI until stronger local model quality is available
- calendar with week-first navigation plus day, month, quarter, and agenda views
- one-time calendar import from ICS files and public calendar URLs
- reminders and in-app notification center
- dashboard and settings
- startup scripts for Windows and Unix-like shells
- `npm run verify`, `npm run verify:full`, `npm run coverage`, and `npm run ai:status`
- unit, integration, component, and end-to-end tests

## Local AI Stack

Required local models:

- text model: `qwen3:4b`
- embedding model: `qwen3-embedding:0.6b`

The app uses Ollama through local HTTP only. The AI layer is used for:

- course suggestion support during smart import
- structured document summarization
- structured quiz generation

Core categorization logic is not delegated blindly to the LLM. Course suggestion is driven primarily by embeddings and application-side scoring, with filename and folder-path hints used only as secondary signals.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Dexie / IndexedDB
- React Hook Form + Zod
- FullCalendar
- `pdfjs-dist`
- `jszip`
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

## Ollama Setup Check

The repo expects Ollama to be reachable locally and the required models to exist.

```bash
npm run ai:status
```

Default local AI configuration:

- `OLLAMA_BASE_URL=http://127.0.0.1:11434/api`
- `OLLAMA_TIMEOUT_MS=90000`
- `OLLAMA_RETRY_COUNT=2`

These values can be overridden through `.env.local`.

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

The e2e runner uses `next start` on `http://127.0.0.1:3100`, so it does not collide with a normal `next dev` session on port `3000`.

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

Supported for extraction and downstream study workflows:

- plain text files
- markdown files
- text-based PDFs
- DOCX
- PPTX

Explicitly not supported:

- scanned or image-only PDFs that require OCR
- images as study inputs
- audio or video
- remote summarization
- remote quiz generation
- essay grading

## Smart Import Behavior

The smart import flow is intentionally conservative:

1. The user uploads files or a folder.
2. The app stores the local files and preserved relative paths.
3. Text is extracted and normalized.
4. The app compares each file only against the user's existing courses.
5. The app produces a best course, second-best course, confidence, status, and reason.
6. The user reviews and can override course and folder decisions.
7. Final assignment is persisted only after confirmation.

Folder-group consistency is a soft signal only. It can reinforce a likely course for sibling files, but it does not override clearly stronger content evidence.

## Honest Runtime Limits

- IndexedDB quota depends on the browser
- browser notifications are best-effort, not native-background guarantees
- preview and extraction support depend on what the browser can safely render or parse
- text-based PDF support does not imply OCR support
- Ollama must be running locally with the required models installed
- clearing site data removes the local workspace and derived study artifacts

## Project Structure

```text
app/                Next.js routes, layouts, and same-origin AI bridge handlers
components/         Reusable UI and feature components
docs/               Current product docs
docs/archive/       Historical reports and superseded planning notes
lib/ai/             Ollama clients, prompts, schemas, and browser bridge helpers
lib/db/             Dexie schema and defaults
lib/i18n/           Locale dictionaries and helpers
lib/repositories/   Persistence boundaries
lib/services/       Product logic, imports, assignment scoring, summaries, and quizzes
lib/validation/     Zod validation schemas
scripts/            Verification helpers and local AI checks
tests/              Unit, component, integration, and e2e tests
types/              Shared domain types
```

## Documentation

- [Documentation Map](docs/README.md)
- [Product Specification](docs/spec.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [User Flows](docs/user-flows.md)
- [UI Pages](docs/ui-pages.md)
- [Setup Guide](docs/setup.md)
- [Archive Index](docs/archive/README.md)

## License

MIT
