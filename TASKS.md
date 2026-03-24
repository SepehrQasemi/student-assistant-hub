# Implementation Backlog

## Completed Foundations

- [x] Phase 1 offline-first workspace
- [x] Phase 2 local document extraction and summarization

## Phase 2 Follow-Up Hardening

- [ ] Add optional export of extracted documents and summary history.
- [ ] Add an explicit regenerate action for users who want a fresh artifact even when the current fingerprint and mode already have a stored summary.
- [ ] Add richer PDF extraction diagnostics for malformed but text-based PDFs.
- [ ] Add denser history controls for files with many summaries.
- [ ] Add summary cleanup tools for large local workspaces.

## Phase 3 Preparation

- [ ] Reuse extracted text and chunking artifacts for quiz generation.
- [ ] Define question templates that consume key concepts and summary sections.
- [ ] Persist quiz drafts without mutating summary artifacts.
- [ ] Add QA datasets for validating quiz quality against deterministic extracted inputs.

## Future Platform Work

- [ ] Add export and restore workflows for full local workspace portability.
- [ ] Design sync adapters only after export/import is stable.
- [ ] Evaluate a desktop wrapper only if browser storage or background limits become a blocking issue.
