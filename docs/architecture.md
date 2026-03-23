# Architecture Direction

## Intended Stack

The planned implementation stack for Student Assistant Hub is:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Supabase Storage

The intended deployment target is Vercel.

## High-Level Architecture

Student Assistant Hub should be built as a web application with a clear split between:

- presentation and interaction logic in Next.js
- identity, persistence, and storage in Supabase

At a high level:

1. The user accesses the application through the Next.js frontend.
2. Authentication is handled through Supabase Auth.
3. Domain records such as courses, files, events, and reminders are stored in Supabase Postgres.
4. Uploaded documents are stored in Supabase Storage, with metadata stored in Postgres.
5. The dashboard, files, and calendar views query normalized domain records rather than tightly coupling UI to storage details.

## Frontend Modules

The future frontend should be organized into the following logical modules:

### Authentication

- login and signup views
- session handling
- protected route access
- sign-out and account recovery flows

### Dashboard

- upcoming events summary
- upcoming reminders summary
- recent file activity
- quick links into courses, files, and calendar

### Courses

- course list
- create and edit course workflows
- course-level filtering context for files and events

### Files

- upload interface
- file list and file metadata views
- search and filter controls
- course assignment and category assignment

### Calendar

- event list or calendar grid views
- event create and edit workflow
- course-linked and standalone events

### Reminders

- reminder configuration attached to events
- reminder timing display
- future extension point for delivery channels

## Backend and Data Responsibilities

### Next.js Responsibilities

- routing and page composition
- server/client rendering boundaries
- UI state management
- form submission handling
- orchestration of data access through a centralized app layer

### Supabase Responsibilities

- user authentication
- row-level data storage in Postgres
- file object storage
- row-level security policies for private user workspaces

### Data Access Layer Responsibilities

The repository should eventually include a shared application layer in `lib/` that:

- centralizes Supabase client creation
- isolates database and storage operations from UI components
- encodes domain rules such as ownership checks, category validation, and reminder constraints

## Current Phase vs Future AI Modules

Phase 1 must keep the core domain independent from AI concerns.

Phase 1 domain:

- profiles
- courses
- files
- events
- reminders

Future AI domain:

- summaries
- quizzes
- quiz questions
- quiz attempts or study progress, if later introduced

Key rule:

AI artifacts should depend on the core domain, not the other way around. Files, courses, and events must remain usable even if AI jobs are unavailable or disabled.

## Future Extensibility Notes

To keep the architecture production-minded, the following extensibility decisions should be respected:

- store file metadata separately from raw storage objects
- preserve stable entity identifiers from the start
- keep controlled values for file categories and event types
- use row-level security rather than only trusting client-side filtering
- avoid putting AI processing logic directly inside basic CRUD modules
- prefer additive tables for summaries and quizzes instead of mutating core entities

## Recommended Initial Boundaries

The first implementation pass should maintain these boundaries:

- `app/`: routes, layouts, page-level composition
- `components/`: reusable UI blocks
- `lib/`: auth, database, storage, validation, and domain services
- `types/`: shared domain types and DTO definitions
- `supabase/`: schema, policies, storage conventions, and migration assets

These boundaries are sufficient for Phase 1 and provide a clean seam for later AI services.
