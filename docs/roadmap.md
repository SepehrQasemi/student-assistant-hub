# Product Roadmap

## Roadmap Overview

The roadmap follows a local-first strategy. The product must become a trustworthy offline student workspace before optional sync or AI features are introduced.

## Phase 1: Offline-First Core Workspace

### Goal

Deliver a fully usable local workspace for student organization with no backend requirement.

### Scope

- bilingual English and French UI
- local Dexie persistence
- courses CRUD
- offline file manager with previews
- local calendar with multiple views
- reminders and notification center
- dashboard
- settings
- automated tests and responsive UX

### Milestones

- M1: documentation rewrite and local architecture scaffold
- M2: persistence, repositories, i18n, and test infrastructure
- M3: courses and file manager
- M4: calendar and event workflows
- M5: reminders, notifications, dashboard, and settings
- M6: responsive polish, QA, and implementation report

## Phase 2: Local Backup and Sync Readiness

### Goal

Prepare the local-first application for optional export, backup, and future sync without breaking Phase 1.

### Scope

- structured export/import of local workspace data
- sync-safe identifiers and conflict-aware repository extensions
- optional backup workflows
- architecture decisions for remote adapters

### Rationale

Before introducing remote sync, the app should support controlled data portability and preserve a clear repository boundary.

## Phase 3: AI Summaries

### Goal

Add AI-generated study summaries on top of the stable local domain model.

### Scope

- summary jobs linked to file metadata
- generated summary persistence
- summary display inside file and course contexts

### Rationale

Summaries should consume existing file data instead of reshaping the file manager around AI.

## Phase 4: Quiz Generation and Study Workflow

### Goal

Extend the workspace into an active study assistant with quizzes and structured review flows.

### Scope

- quiz generation from files or summaries
- quiz question persistence
- interactive study sessions
- future progress tracking

### Rationale for Ordering

1. A reliable local workspace is more valuable than premature AI.
2. Export and sync readiness should come before remote infrastructure.
3. AI features should build on stable source data and not distort Phase 1 architecture.
