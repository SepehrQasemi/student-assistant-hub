# Initial Decisions

> Historical note: this document records bootstrap-era decisions. Some early assumptions were later superseded by the delivered offline-first architecture. Read it as project history, not as the current source of truth.

## 1. Documentation-First Start

This remained valid. The repository started with planning documents before application code so later implementation work had a stable reference point.

## 2. The Early Product Had to Focus on the Workspace Core

The spirit of this decision remained valid, but the original Phase 1 shape changed as the product moved toward a fully local-first implementation.

What remained true:

- the core workspace had to come before summaries and quizzes
- AI-style study features could not define the initial architecture

What changed:

- the delivered product did not keep the original backend-oriented auth plan

## 3. Supabase as the Primary Backend Service

This decision was superseded.

The shipped product moved in the opposite direction:

- offline-first
- local-first
- no backend requirement
- no cloud storage requirement

This superseded the initial Supabase assumption rather than partially implementing it.

## 4. Files as Metadata Plus Binary Content

This decision remained valid, but the implementation boundary changed.

What the product actually shipped:

- file metadata stored locally
- binary file payloads stored locally in IndexedDB
- searchable metadata and derived study artifacts tied to the same file record

The important modeling idea survived even though the storage implementation became fully local instead of backend-backed.

## 5. Study Artifacts Must Be Additive

This remained valid and is now reflected in the implementation.

Summaries, concepts, quizzes, attempts, and answers are stored as separate artifacts rather than changing the meaning of course, file, or event records.
