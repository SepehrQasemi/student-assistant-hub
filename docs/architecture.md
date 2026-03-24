# Architecture

## Core Direction

Student Assistant Hub is a fully local, offline-first web application. The app runs in the browser, stores its primary data in IndexedDB through Dexie, and keeps product logic behind repository and service boundaries.

There is still no backend in the current product state.

## Main Libraries

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Dexie
- React Hook Form + Zod
- FullCalendar
- `pdfjs-dist`
- Vitest + Testing Library
- Playwright

Phase 4 did not add a new product-domain dependency. It added startup and verification tooling around the existing application.

## Architectural Layers

### UI Layer

Responsibilities:

- route composition
- page layout
- dialogs, tabs, cards, and forms
- loading, empty, error, and stale states
- responsive rendering

Rules:

- do not access IndexedDB directly
- do not implement document-processing, summary, quiz, reminder, or scoring logic inside components
- source user-facing text from the i18n layer

### Application / Service Layer

Responsibilities:

- file filtering and sorting
- dashboard aggregation
- event filtering
- reminder scheduling
- notification dispatch
- document ingestion and extraction
- normalization and chunking
- summarization and concept extraction
- quiz source selection, generation, evaluation, and review
- stale detection

### Repository Layer

Responsibilities:

- CRUD and query access for all persisted entities
- Dexie-specific coordination
- preserving a stable persistence boundary for later export or sync work

### Local Persistence Layer

Responsibilities:

- Dexie schema definitions
- version upgrades
- table declarations
- local defaults

### i18n Layer

Responsibilities:

- English and French dictionaries
- runtime locale switching
- persisted locale preference
- safe translation fallback behavior

### Tooling / Verification Layer

Phase 4 hardened the project around:

- startup scripts for Windows and Unix-like shells
- `scripts/verify.mjs` for repeatable verification
- coverage instrumentation through Vitest
- Playwright failure artifacts for debugging real browser regressions

## High-Level Data Flow

### Workspace Flow

1. UI components trigger feature actions.
2. Repositories handle persistence.
3. Services aggregate or derive higher-level product behavior.
4. UI re-renders through live queries and local state.

### Summary Flow

1. A file is selected from the file workspace.
2. The ingestion service resolves file type and extraction strategy.
3. Extracted text is normalized and chunked.
4. The summarization service produces deterministic summary artifacts.
5. Repositories persist extracted documents, summaries, sections, and concepts.

### Quiz Flow

1. A supported file is selected from the file workspace.
2. Quiz services load the current extracted document plus summary artifacts for the same fingerprint.
3. Candidate services select useful source material.
4. Question generation produces deterministic multiple-choice and true/false questions.
5. Quiz repositories persist the quiz, questions, attempts, and answers.
6. Review services expose score, explanations, history, and stale state.

## Persistence Strategy

Core persisted domains:

- courses
- files and file blobs
- tags
- events
- reminders
- notifications
- settings
- extracted documents
- summaries, sections, concepts
- quizzes, questions, attempts, answers

Key persistence principles:

- stable local-safe identifiers
- timestamps on persisted entities
- additive derived artifacts instead of destructive overwrites
- file fingerprint tracking for stale summary and stale quiz detection

## Phase 4 Hardening Decisions

### Startup

The project now exposes explicit local run scripts:

- `RUN_ME_WINDOWS.bat`
- `RUN_ME_WINDOWS.ps1`
- `RUN_ME_UNIX.sh`
- `STOP_WINDOWS.ps1`
- `STOP_UNIX.sh`

These scripts:

- check Node and npm availability
- check dependencies
- detect busy-port conditions
- launch the dev server
- store a PID for stop flows

### Verification

The project now exposes:

- `npm run verify`
- `npm run verify:full`
- `npm run coverage`

This keeps the main verification path short and repeatable while leaving e2e optional in the default verify flow.

### Responsive Behavior

Phase 4 focused on practical responsive hardening rather than introducing a new design system. Fixes centered on:

- dialog width and padding
- tab wrapping
- mobile navigation labels
- calendar overflow handling
- quiz and summary panel stacking
- date formatting width pressure

### Localization

Phase 4 tightened the English/French boundary by:

- auditing both dictionaries
- removing awkward or stale French wording
- ensuring high-pressure UI areas still render acceptably with longer French labels

## Browser and Runtime Limits

- IndexedDB availability and quota depend on the browser
- browser notifications remain best-effort
- preview and extraction quality depend on browser/runtime support
- text-based PDF support does not imply OCR support
- summaries and quizzes remain deterministic local heuristics, not cloud-model reasoning
