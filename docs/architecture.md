# Architecture Direction

## Primary Architecture

Student Assistant Hub Phase 1 is a fully local, offline-first web application. It runs entirely in the browser and stores primary data in IndexedDB through Dexie.

There is no backend in Phase 1.

## Main Libraries

- Next.js App Router for routing and UI composition
- TypeScript for typed domain and persistence contracts
- Tailwind CSS for styling
- shadcn/ui-style component architecture for reusable UI primitives
- Dexie for IndexedDB access and schema versioning
- React Hook Form + Zod for forms and validation
- FullCalendar for calendar rendering across required views
- Notifications API for browser-level notifications where supported
- Vitest and Testing Library for automated tests
- Playwright for end-to-end coverage where feasible

## Architectural Layers

### UI / Pages / Components

Responsibilities:

- page layout and route composition
- feature presentation
- form interaction
- empty, loading, and error states
- responsive behavior

Rules:

- UI must not directly read or write IndexedDB
- user-facing text must go through the i18n layer

### Application Logic / Services

Responsibilities:

- feature orchestration
- dashboard aggregation
- file filtering and sorting rules
- reminder scheduling logic
- notification workflows
- browser capability checks

### Repository Layer

Responsibilities:

- CRUD access to courses, files, tags, events, reminders, notifications, and settings
- ownership of persistence-specific details
- migration-friendly data access boundaries

This layer is the seam that allows future sync adapters to be introduced later.

### Local Persistence Layer

Responsibilities:

- Dexie database definition
- schema versioning
- table initialization
- IndexedDB access utilities

### i18n Layer

Responsibilities:

- locale dictionaries
- translation lookup
- runtime locale switching
- persistence of the selected language

### Reminder Scheduling / Notification Engine

Responsibilities:

- evaluating due reminders
- creating in-app notifications
- requesting browser notification permission
- sending browser notifications only when supported and allowed

## High-Level Data Flow

1. A page or client feature component triggers a user action.
2. The action calls a service or repository-facing hook.
3. Services coordinate repository calls and domain logic.
4. Repositories persist or query local data through Dexie.
5. UI updates through Dexie-backed live queries and local state.

## Local-First Design Principles

- store metadata separately from derived presentation state
- keep entity IDs stable using `crypto.randomUUID()`
- include timestamps on all primary entities
- prefer additive schemas over implicit state hidden in components
- isolate browser APIs such as Notifications and file previews behind services or utilities

## Future Sync Extensibility

The application is intentionally designed so future sync can be added without rewriting the UI:

- repositories are a dedicated layer
- local entities already carry sync-safe IDs and timestamps
- delete operations can be represented with soft-delete semantics where useful
- service logic does not assume Dexie is the only possible backing store forever

## Browser Limitation Policy

The implementation must remain honest:

- IndexedDB availability depends on the browser context
- notification delivery cannot be guaranteed when the app is not running
- unsupported file formats fall back to metadata display instead of fake previews
- offline-first means no server dependency, not native-background guarantees
