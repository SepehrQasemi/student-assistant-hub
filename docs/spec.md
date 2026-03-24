# Product Specification

## Product Overview

Student Assistant Hub is an offline-first student workspace for managing academic organization and study workflows locally in the browser.

The current product combines:

- local course management
- local file management
- calendar and reminders
- deterministic local summaries
- deterministic local quizzes

It does this without introducing a backend, cloud sync, remote inference, or paid APIs.

## Problem Statement

Students usually split their academic workflow across multiple disconnected tools:

- folders for files
- calendars for deadlines
- reminder apps for follow-up
- note apps for summaries
- quiz tools for self-testing

That fragmentation causes context loss and weakens trust. Student Assistant Hub solves this by keeping the organization, document understanding, and study loop attached to the same local file records and the same offline-first persistence model.

## Target Users

Primary users:

- students handling multiple courses and many study files
- students who want privacy-friendly local study tooling
- students working across English and French UI contexts

Secondary users:

- users who want to revisit prior summaries and quiz attempts later
- users who prefer deterministic local processing over remote AI services

## Implemented Product Scope

### Phase 1

- bilingual English and French UI
- Dexie-backed IndexedDB persistence
- courses CRUD
- offline file manager with previews, filters, notes, tags, and course linkage
- calendar with day, week, month, quarter, and agenda views
- reminders and in-app notification center
- dashboard
- settings

### Phase 2

- document type detection
- extraction for plain text, markdown, and text-based PDFs
- extraction status persistence
- text normalization
- deterministic chunking
- deterministic summaries
- key concept extraction
- summary history
- stale summary detection

### Phase 3

- quiz generation from one supported file at a time
- deterministic multiple-choice and true/false generation
- quiz options for count, mode, focus mode, and explanations
- quiz persistence
- question persistence
- attempt and answer persistence
- scoring and results review
- quiz history and attempt history
- stale quiz detection

### Phase 4

- documentation audit and cleanup
- easier local startup paths
- explicit verify tooling
- stronger coverage instrumentation
- wider unit, integration, component, and e2e coverage
- responsive audit and targeted fixes
- bilingual English/French audit and cleanup
- French spelling and layout-pressure cleanup

## Primary Use Cases

- import and organize files locally
- connect files, courses, events, and reminders
- generate summaries for supported files
- generate quizzes for supported files
- complete quizzes and review results
- revisit prior summaries and attempts later
- detect when study artifacts are stale after a file source changes
- run and verify the project locally with a clear startup path

## Out of Scope

The current product intentionally does not include:

- cloud sync
- remote AI services
- OCR for scanned PDFs
- chat with documents
- flashcards
- spaced repetition
- essay grading
- multi-file reasoning
- collaboration features

Short-answer grading is intentionally deferred instead of being shipped with weak or misleading evaluation.

## Success Criteria

The current product state is successful when a user can:

- run the app locally without ambiguous setup
- use the workspace entirely without a backend
- switch between English and French without missing major translations
- organize study files, summaries, quizzes, events, reminders, and settings in one local workspace
- trust that summaries and quizzes stay tied to the correct file fingerprint
- run lint, tests, build, and e2e verification through documented commands

Engineering-level success criteria:

- page components do not contain repository or generation logic
- persistence stays behind repositories
- critical workflows have meaningful automated coverage
- responsive layouts remain usable across major viewport classes
- docs match the implementation rather than an aspirational future state

## Constraints and Assumptions

### Constraints

- the app must remain offline-first and local-first
- browser storage quotas still apply
- browser notification delivery remains best-effort
- extraction and preview support must stay honest about browser/runtime limits
- startup and verification flows must remain simple enough for a local student project workflow

### Assumptions

- one user works inside one browser profile
- clearing browser site data removes the local workspace
- text-based PDF support depends on actual embedded text
- deterministic summaries and quizzes are sufficient for local study support even though they are not LLM reasoning
