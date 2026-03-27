# Product Specification

## Product Overview

Student Assistant Hub is an offline-first student workspace for managing academic organization and study workflows locally in the browser.

The current product combines:

- local course management
- nested folders for course workspaces and My Drive
- local file management
- smart import review against existing courses only
- calendar and reminders
- one-time calendar import from ICS files and public URLs
- local Ollama-backed summaries
- local Ollama-backed quizzes

It does this without introducing a remote backend, cloud sync, or paid AI APIs.

## Problem Statement

Students usually split their academic workflow across multiple disconnected tools:

- folders for files
- calendars for deadlines
- reminder apps for follow-up
- note apps for summaries
- quiz tools for self-testing

That fragmentation causes context loss and weakens trust. Student Assistant Hub solves this by keeping organization, document understanding, and study workflows attached to the same local file records and the same offline-first persistence model.

## Target Users

Primary users:

- students handling multiple courses and many study files
- students who want privacy-friendly local study tooling
- students working across English and French UI contexts

Secondary users:

- users who want to bulk import mixed academic files without losing structure
- users who want AI assistance without giving AI permission to invent course structure
- users who want to revisit prior summaries and quiz attempts later

## Implemented Product Scope

### Organization and Import

- bilingual English and French UI
- Dexie-backed IndexedDB persistence
- courses CRUD
- optional course descriptions
- nested folders inside each course and inside My Drive
- dedicated course workspace pages with course-scoped files, folders, calendar, and study entry points
- manual upload into a selected course, course folder, or drive folder
- bulk mixed-file upload
- folder import with preserved relative paths
- review-first smart import with per-file suggestions, alternate courses, confidence, status, and reason
- degraded smart import review when local embedding or assignment analysis is unavailable
- explicit confirmation before final course or folder assignment

### Document Understanding

- document type detection
- extraction for plain text, markdown, text-based PDFs, DOCX, and PPTX
- extraction status persistence
- text normalization
- deterministic chunking
- reusable document representations for assignment and study flows
- course profile building from course metadata and confirmed course documents
- embedding-driven course suggestion using local Ollama
- preserved import metadata for later reasoning and review

### Study Features

- structured summary generation from stored extracted text
- coverage-first structured summaries that aim to explain all major lesson concepts
- summary history
- explicit regenerate action per summary mode while keeping older history entries
- study notes generation that expands into denser revision notes instead of only sparse review bullets
- file-level study notes remain available inside each file detail dialog
- course-level multi-file study notes are archived from the current UI until stronger local models are available
- stale summary detection
- structured quiz generation from one supported file or from multiple files inside one course workspace
- per-file weighting when generating a course-level quiz
- quiz options for count, mode, focus mode, and explanations
- quiz persistence
- normalized persistence of quiz source files and weights
- question persistence
- attempt and answer persistence
- scoring and results review
- quiz history and attempt history
- stale quiz detection

### Calendar and Productivity

- calendar with week-first day, week, month, quarter, and agenda views
- one-time ICS import from file or public URL into editable local events
- reminders and in-app notification center
- dashboard
- settings

### Tooling and Hardening

- easier local startup paths
- explicit verify tooling
- coverage instrumentation
- meaningful unit, integration, component, and e2e coverage
- responsive audit and targeted fixes
- English/French dictionary synchronization
- local AI readiness checks through `npm run ai:status`

## Local AI Requirements

Required local models:

- text model: `qwen3:4b`
- embedding model: `qwen3-embedding:0.6b`

The AI stack is used for:

- summary generation
- quiz generation
- semantic comparison between imported files and existing courses

The AI stack is intentionally constrained:

- the system can only choose among existing courses
- the system never creates a course automatically
- final assignment always requires user confirmation
- application code owns the ranking and threshold logic instead of burying decisions inside prompts

Current model-quality note:

- `qwen3:4b` is currently acceptable for file-level summaries and quizzes after pipeline hardening
- the same model is not yet reliable enough for the desired quality of course-level multi-file study notes, so that UI surface is archived for now

## Primary Use Cases

- create courses plus folders in both course workspaces and My Drive
- import and organize files locally
- bulk import mixed files or entire folders
- preserve relative paths during folder import
- review AI suggestions before final assignment
- connect files, courses, events, and reminders
- work inside a course-specific workspace without creating duplicate study pipelines
- import another calendar as a local copy without introducing sync dependencies
- generate summaries for supported files
- generate quizzes for supported files
- generate one course quiz from all files or a selected subset of course files
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
- collaboration features
- automatic course creation by AI
- silent auto-application of uncertain import suggestions

## Success Criteria

The current product state is successful when a user can:

- run the app locally without ambiguous setup
- use the workspace entirely without a remote backend
- switch between English and French without missing major translations
- create courses first and let AI choose only among those courses
- organize files inside course folders or drive folders
- import a folder and preserve relative path context
- review and override file-course suggestions before assignment is finalized
- generate summaries and quizzes from stored extracted text using local Ollama
- trust that summaries and quizzes stay tied to the correct file fingerprint
- run lint, tests, build, and e2e verification through documented commands

Engineering-level success criteria:

- page components do not contain repository or generation logic
- persistence stays behind repositories
- smart import suggestions remain explainable and code-driven
- critical workflows have meaningful automated coverage
- responsive layouts remain usable across major viewport classes
- docs match the implementation rather than an aspirational future state

## Constraints and Assumptions

### Constraints

- the app must remain offline-first and local-first
- browser storage quotas still apply
- browser notification delivery remains best-effort
- extraction and preview support must stay honest about browser and runtime limits
- smart import must only target existing courses
- folder grouping can influence suggestions only as a soft signal
- startup and verification flows must remain simple enough for a local student project workflow

### Assumptions

- one user works inside one browser profile
- clearing browser site data removes the local workspace
- text-based PDF support depends on actual embedded text
- DOCX and PPTX extraction are text-first and may not reflect visual layout exactly
- Ollama is installed locally when AI-backed features are used
