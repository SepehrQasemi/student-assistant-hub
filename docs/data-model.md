# Data Model

The application persists normalized records in IndexedDB through Dexie.

## Main record groups

- courses and course settings
- stored file metadata and extracted documents
- events, deadlines, and reminders
- summaries, summary sections, and scored concepts
- quizzes, questions, options, attempts, and answers
- application settings and migration metadata

Derived summaries and quizzes retain a source fingerprint. When a stored file changes, the application can identify older derived artifacts as stale instead of silently presenting them as current.

See `lib/db/app-db.ts` for the authoritative schema versions and `lib/types/` for current record shapes. Repository modules provide the supported persistence interface; UI code should not bypass them.
