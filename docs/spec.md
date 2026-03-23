# Product Specification

## Product Overview

Student Assistant Hub is an offline-first student workspace for organizing academic life locally in the browser. It is designed for students who need serious day-to-day support for courses, files, deadlines, exams, reminders, and weekly planning without depending on a backend service.

Phase 1 is intentionally local-first. It prioritizes reliability, clarity, and realistic browser behavior over cloud connectivity or AI features.

## Problem Statement

Students routinely work across disconnected tools:

- folders for lecture files
- calendar tools for deadlines
- reminder apps for exams
- notes apps for personal study
- course information spread across documents and chats

That fragmentation causes real operational problems:

- files become hard to find later
- deadlines lose context because they are not connected to courses
- reminders are easy to miss when they live in separate tools
- there is no single dashboard showing what matters this week

Student Assistant Hub solves this first as a structured local workspace, then leaves room for optional sync and AI later.

## Target Users

Primary users:

- students managing several courses at once
- students handling many academic files and deadlines
- students who want a privacy-friendly workspace that still works without online services

Secondary users:

- students who plan to use future sync or AI features later
- students using a laptop-first workflow but needing responsive browser support on smaller screens

## Primary Use Cases

- create and maintain a course list
- import local study files and keep them organized
- assign files and events to courses
- preview supported file types without leaving the workspace
- plan classes, deadlines, exams, meetings, and personal study sessions
- create multiple reminders for a single event
- review a dashboard for upcoming deadlines, exams, reminders, and recent files
- switch the application between English and French

## Phase 1 Scope

Phase 1 includes:

- bilingual application UI with English and French dictionaries
- local persistence through IndexedDB
- course CRUD
- offline file manager with local blob storage and realistic previews
- calendar with day, week, month, quarter, and agenda views
- reminders and notification center
- dashboard with useful summaries
- settings for language, notification preferences, and local app behavior
- automated tests and responsive UX

## Out of Scope for Phase 1

Phase 1 does not include:

- Supabase, Firebase, or any hosted backend
- online authentication
- multi-device sync
- collaborative workspaces
- AI summaries
- AI quiz generation
- advanced background notification guarantees beyond browser capabilities
- pretending unsupported file formats are previewable when they are not

## Success Criteria for Phase 1

Phase 1 is successful when a student can:

- use the application without any cloud dependency
- switch between English and French without partial translations
- create, edit, and delete courses locally
- import and manage files locally with metadata, notes, filters, and sorting
- preview PDFs, images, and plain text files where browser support exists
- create, edit, filter, and review events across multiple calendar views
- configure and manage multiple reminders per event
- use the dashboard to understand what matters now

Engineering-level success criteria:

- persistence is routed through repositories rather than page components
- IndexedDB schemas are versioned and migration-friendly
- reminder behavior is abstracted behind a scheduler layer
- tests validate real behavior across repositories, services, and selected UI flows

## Constraints and Assumptions

### Constraints

- the product must be fully usable without remote services
- the application must remain honest about browser notification and storage limits
- user-facing strings should be translatable through one consistent i18n strategy
- the file manager is the most important module in Phase 1

### Assumptions

- the app is used by a single person per browser profile
- local data loss can occur if the user clears browser storage
- browser notifications are opportunistic and depend on permission plus the app being able to execute
- future sync should extend the repository layer rather than force a rewrite of the UI
