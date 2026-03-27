# Architecture

## Core Direction

Student Assistant Hub remains a fully local, offline-first web application.

Primary product data lives in IndexedDB through Dexie. The app does not use a remote backend, cloud persistence layer, or remote AI provider.

The current repository does use a small same-origin runtime surface inside Next.js route handlers for two narrow purposes:

- bridging the browser application to local Ollama
- bridging remote ICS fetches when browser CORS blocks direct client access

That runtime surface is not treated as a product backend. The domain model, persistence, and workflow state still remain browser-local.

## Main Libraries

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Dexie
- React Hook Form + Zod
- FullCalendar
- `pdfjs-dist`
- `jszip`
- Vitest + Testing Library
- Playwright

## Architectural Layers

### UI Layer

Responsibilities:

- route composition
- page layout
- dialogs, tabs, tables, cards, and forms
- course-scoped workspace composition
- drive-style file manager navigation and bulk selection
- import review and confirmation UI
- loading, empty, error, and stale states
- responsive rendering

Rules:

- do not access IndexedDB directly
- do not implement extraction, assignment scoring, summary generation, quiz generation, reminder logic, or notification logic inside components
- source user-facing text from the i18n layer

### Application / Service Layer

Responsibilities:

- file filtering and sorting
- dashboard aggregation
- course workspace aggregation
- event filtering
- calendar import parsing and recurrence expansion
- reminder scheduling
- notification dispatch
- document ingestion and extraction
- normalization and chunking
- document representation building
- course profile building
- embedding-driven assignment suggestion
- folder consistency analysis
- import review and confirmation
- summarization
- quiz generation
- stale detection

The service layer owns the business rules for smart import:

- suggestions can only target existing user courses
- content similarity is the dominant signal
- filename, path, and folder-group consistency are secondary signals
- confirmation is required before final assignment is persisted
- analysis failures must degrade to reviewable `unknown` items instead of silently dropping the batch

### Repository Layer

Responsibilities:

- CRUD and query access for all persisted entities
- Dexie-specific coordination
- stable persistence boundaries for future export or migration work

Persistence rules:

- pages and feature components do not write to IndexedDB directly
- final course and folder assignment flows go through repositories
- summary and quiz persistence remains tied to extracted document fingerprints

### Local AI Bridge Layer

Responsibilities:

- centralize Ollama base URL, timeout, and retry configuration
- expose structured generation and embeddings through a stable local client
- validate summary and quiz JSON outputs
- normalize slightly incomplete summary JSON so long study-note runs do not fail on minor field-count drift
- tolerate qwen-style structured outputs whether JSON arrives in the normal response field or the model thinking field
- surface clear runtime errors when Ollama or required models are unavailable

Current route handlers:

- `GET /api/ai/status`
- `POST /api/ai/embed`
- `POST /api/ai/summarize`
- `POST /api/ai/quiz`

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

Responsibilities:

- startup scripts for Windows and Unix-like shells
- `scripts/verify.mjs` for repeatable verification
- `scripts/check-ollama.mjs` for local AI readiness checks
- coverage instrumentation through Vitest
- Playwright failure artifacts for browser regressions

## High-Level Data Flow

### Manual Upload Flow

1. The UI collects files plus an optional course and an optional in-scope folder.
2. The import service resolves preserved relative paths when requested.
3. The file repository stores metadata, blob content, and source fingerprint locally.
4. Files without a selected course remain in the general drive and can still be stored inside drive folders.
5. The assignment repository records the confirmed course assignment only when a course is selected.

### Smart Import Flow

1. The user uploads mixed files or a folder import.
2. Files are stored locally with import-batch metadata and preserved relative paths.
3. The ingestion service extracts and normalizes document text.
4. Document representations are embedded through local Ollama.
5. Course profile embeddings are built from existing confirmed course material.
6. The assignment suggester ranks only the user's existing courses.
7. Folder-group analysis can add a small consistency bonus.
8. If automatic analysis is unavailable, review items still persist with `unknown` status and explicit reasons.
9. Review items are persisted with suggested course, alternate course, confidence, status, and reason.
10. The user confirms or overrides course and folder choices.
11. Final assignments are persisted only after confirmation.

### Summary Flow

1. The user generates summaries from one stored file at a time through the file detail dialog.
2. The ingestion service resolves the current extraction state by fingerprint for that file.
3. Extracted text is normalized and chunked.
4. The summary generator calls local Ollama with a structured JSON prompt reinforced by heading hints and deterministic concept hints.
5. Long runs summarize chunks with bounded concurrency so local Ollama does not get overwhelmed by large files.
6. Repositories persist the summary header, normalized source links, sections, and important terms, with concept terms reinforced by deterministic extraction when the model returns generic study words.
7. Older summaries remain available and become stale when the linked source fingerprint changes.

Current product note:

- course-level multi-file study-note generation remains in the local service layer for future reactivation, but it is archived from the current UI until stronger local model quality is available

### Quiz Flow

1. The user can generate a quiz either from one file or from a course-level bundle of several files.
2. The app reuses current extracted documents and current summary artifacts for every selected file fingerprint.
3. For course quizzes, selected source files carry explicit weights that affect how much context each file contributes to the prompt.
4. The quiz generator calls local Ollama with a structured JSON prompt built from the weighted source bundle.
5. Output is schema-validated before persistence.
6. Repositories persist the quiz header, normalized source links, questions, attempts, and answers.
7. Review services expose score, explanations, history, source-file mix, and stale state.

## Persistence Strategy

Core persisted domains:

- courses
- course folders
- files and file blobs
- document assignments
- import batches and import batch items
- tags
- events
- reminders
- notifications
- settings
- extracted documents
- course profiles and document embeddings
- summaries, sections, concepts
- quizzes, quiz source links, questions, attempts, answers

Key persistence principles:

- stable local-safe identifiers
- timestamps on persisted entities
- explicit provenance for assignment changes
- additive derived artifacts instead of destructive overwrites
- imported calendar events become normal local events instead of remote subscriptions
- file fingerprint tracking for stale summary and stale quiz detection
- quiz source links normalize multi-file course quizzes instead of collapsing them into synthetic file records
- trash is implemented as a soft-delete state until the user permanently deletes a file
- folders are workspace-scoped by `courseId`: a course folder keeps a course id, and a drive folder uses `courseId = null`
- general-drive files can now live inside the same folder model instead of staying outside the folder tree
- preserved import relative paths remain metadata, but direct drive imports can recreate matching drive folders when requested

## Assignment Strategy

The smart import scorer is intentionally explainable and application-driven.

Primary signal:

- embedding similarity between the document representation and each course profile

Secondary signals:

- overlap between filename or relative path and course metadata
- overlap between filename or relative path and course profile keywords
- modest folder-group consistency bonus inside one imported folder cluster

Status output:

- `suggested` for strong score and clear margin
- `needs_review` for usable but ambiguous matches
- `unknown` for weak or unreliable matches

The folder-group bonus is explicitly soft. It cannot override a clearly stronger semantic match from the document content.

## Browser and Runtime Limits

- IndexedDB availability and quota depend on the browser
- browser notifications remain best-effort
- preview and extraction quality depend on browser/runtime support
- text-based PDF support does not imply OCR support
- DOCX and PPTX extraction are text-first OOXML reads, not layout-faithful rendering
- local AI features depend on Ollama reachability and model availability
