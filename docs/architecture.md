# Architecture

Student Assistant Hub is a local-first Next.js application. React pages and components call application services; services use repository modules; repositories persist records through Dexie in IndexedDB.

## Boundaries

- `app/` and `components/`: UI and route composition
- `lib/services/`: document ingestion, deterministic summaries, concept extraction, quizzes, calendar processing, backup and restore
- `lib/repositories/`: persistence operations and query boundaries
- `lib/db/`: schema versions and IndexedDB migrations
- `app/api/`: only narrow browser capability bridges that exist in source; there is no AI runtime API

## Document flow

1. A user selects a supported local file.
2. The ingestion service extracts text and records a content fingerprint.
3. Deterministic services score concepts and select source sentences.
4. Summary sections or quiz questions are stored with the source fingerprint.
5. A later file replacement marks derived artifacts stale when fingerprints differ.

## Data ownership

All workspace records are held in the active browser profile. Export and restore provide portability, but there is no cloud sync, remote account, or server-side workspace database.

## Reliability controls

Schema migrations are versioned in Dexie. Repository and service tests use fake IndexedDB. Fingerprints connect derived study artifacts to their source version, and backup validation rejects malformed imports.
