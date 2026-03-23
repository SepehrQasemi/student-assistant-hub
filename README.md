# Student Assistant Hub

Student Assistant Hub is a web-based student workspace for managing courses, academic files, deadlines, exams, calendar events, and reminders in one place.

This repository currently contains the planning and foundation stage of the product. It is intentionally documentation-first: the goal of this baseline is to lock product scope, architecture direction, data design, and delivery sequencing before feature implementation starts.

## Product Vision

Students often split their academic workflow across cloud drives, messaging apps, calendars, notes, and ad hoc reminder tools. Student Assistant Hub aims to reduce that fragmentation by providing a single workspace for:

- course organization
- academic file management
- deadline and exam tracking
- calendar planning
- reminder configuration
- future AI-assisted study support

The near-term objective is to deliver a reliable core workspace. AI features are planned, but they are intentionally deferred until the operational foundation is stable.

## Roadmap Summary

- Phase 1: File Manager + Calendar + Dashboard + Auth + Reminder configuration
- Phase 2: AI summaries
- Phase 3: AI quiz generation
- Phase 4: Quiz interaction and extended study workflow

## Current Phase Focus

The current focus is Phase 1 planning and repository setup. The implementation target for Phase 1 is a secure, production-minded MVP that allows a student to:

- authenticate into a private workspace
- create and manage courses
- upload and organize academic files
- create calendar events tied to courses
- configure reminders for those events
- review an at-a-glance dashboard of upcoming work

Phase 1 does not include AI summaries, quiz generation, or interactive study experiences.

## Intended Stack Direction

The implementation direction defined for the next build phase is:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Vercel for deployment

This stack keeps the initial product lean while still supporting secure authentication, structured data, file storage, and future extensibility for AI workflows.

## Repository Structure

The repository has been prepared with a clean base structure for the future application:

```text
app/         Next.js app routes and layouts
components/  Reusable UI components
docs/        Product, architecture, and delivery documentation
lib/         Shared application services and integrations
public/      Static assets
supabase/    Database, storage, and Supabase-related assets
types/       Shared TypeScript types and domain models
TASKS.md     Implementation backlog
AGENTS.md    Repo-local guidance for coding agents
```

## Setup Summary

There is no runnable application in the repository yet. The next implementation phase should scaffold the Next.js application into the existing folder structure, connect Supabase, and begin Phase 1 delivery.

For setup expectations, environment variables, and future deployment notes, see [docs/setup.md](docs/setup.md).

## Documentation Index

- [Product Specification](docs/spec.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [User Flows](docs/user-flows.md)
- [UI Pages](docs/ui-pages.md)
- [Setup Guide](docs/setup.md)
- [Decisions](docs/decisions.md)
- [Non-Goals](docs/non-goals.md)
- [Bootstrap Report](docs/bootstrap-report.md)

## Status

This repository is ready for the next step: scaffolding the app and implementing Phase 1 against the documented plan.
