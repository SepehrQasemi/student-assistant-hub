# Current Product Specification

Student Assistant Hub is an offline-first, single-user browser workspace for organizing courses and study material.

## Implemented scope

- course, file, event, deadline, and reminder management
- local text extraction for supported documents
- deterministic summary and concept generation
- deterministic study quiz generation and attempt history
- source fingerprinting and stale-artifact detection
- IndexedDB persistence, schema migration, export, and restore
- English and French UI

## Non-goals

- cloud accounts or synchronization
- paid AI APIs, Ollama, embeddings, or LLM-generated content
- collaborative editing
- authoritative grading or academic recommendations

## Constraints

The browser owns persistence. Clearing browser data can remove the workspace. Summary and quiz quality depends on extractable source text and transparent heuristic rules.
