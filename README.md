# Student Assistant Hub

Student Assistant Hub is an offline-first student workspace for managing courses, academic files, deadlines, calendar events, reminders, and study organization in one place.

Phase 1 is implemented as a fully local web application foundation. It does not require Supabase, Firebase, or any backend service. All primary data is stored locally in the browser through IndexedDB via Dexie.

## Product Vision

Students often split their academic workflow across folders, cloud drives, calendars, reminders, and notes tools that do not share context. Student Assistant Hub brings those responsibilities into one productivity workspace with a future path toward optional sync and AI-assisted study features.

Phase 1 focuses on making the local workspace genuinely useful before adding any online dependency:

- bilingual UI: English default, French secondary
- course management
- offline file workspace with local blob storage
- full calendar views
- reminders and in-app notifications
- dashboard overview
- settings and storage visibility
- tests from the start

## Phase 1 Scope

Phase 1 is complete when the local application can:

- create, edit, list, and delete courses
- import one or multiple files and store them locally
- filter, search, sort, preview, and organize files
- create, edit, and delete local calendar events
- attach multiple reminders to events
- surface reminders through an in-app notification center
- switch language between English and French
- persist settings and workspace data locally

Phase 1 explicitly excludes:

- cloud sync
- online authentication
- AI summaries
- AI quiz generation
- collaboration features

## Architecture Direction

The application is built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture
- Dexie for IndexedDB persistence
- React Hook Form + Zod
- FullCalendar for calendar rendering
- Notifications API where the browser allows it
- Vitest and Testing Library for automated testing
- Playwright for end-to-end verification where feasible

The codebase is separated into:

- `app/` for routes and page composition
- `components/` for reusable UI and feature components
- `lib/repositories/` for persistence-facing data access
- `lib/services/` for application behavior and scheduling
- `lib/db/` for IndexedDB schema and initialization
- `lib/i18n/` for bilingual translation infrastructure
- `types/` for domain entities and view models

## Current Product Priorities

The most important product area in Phase 1 is the offline file manager. It is treated as a serious workspace feature rather than a placeholder uploader. That means:

- local blob storage
- meaningful metadata
- notes and tagging support
- list and grid modes
- search, filtering, and sorting
- honest preview support for realistic file types

## Browser and Runtime Constraints

Student Assistant Hub is offline-first, not a native desktop app. The implementation is honest about web platform limits:

- browser notifications only work when permission is granted
- reminder delivery cannot be guaranteed when the browser is fully closed
- preview support depends on file type and browser capabilities
- IndexedDB storage availability and quotas depend on the browser

## Project Structure

```text
app/                Next.js routes and layouts
components/         UI building blocks and feature components
docs/               product, architecture, QA, and implementation reports
lib/db/             Dexie schema and local database utilities
lib/i18n/           translation dictionaries and i18n helpers
lib/repositories/   local persistence repositories
lib/services/       business logic, dashboard, reminder, and notification services
lib/validation/     Zod schemas and form validation factories
tests/              unit, component, and end-to-end tests
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

## Local Development

After installing dependencies, use:

```bash
npm run dev
```

For verification:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## Status

This repository contains the offline-first Phase 1 application and its supporting documentation. Future phases should build on this local-first foundation instead of replacing it.
