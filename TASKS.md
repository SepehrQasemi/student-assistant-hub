# Implementation Backlog

## Completed Product Foundation

- [x] Phase 1 offline-first workspace
- [x] Phase 2 local document extraction and summarization
- [x] Phase 3 local quiz generation, execution, scoring, review, and history
- [x] Phase 4 hardening pass for startup, verification, coverage, responsive UX, and bilingual cleanup

## High-Confidence Follow-Ups

- [ ] Add export and restore for the full local workspace.
- [ ] Add safer backup guidance for users who rely on IndexedDB-only persistence.
- [ ] Add broader text-based PDF fixtures for extraction, summarization, and quiz-generation quality checks.
- [ ] Add denser manual-regenerate controls for summaries and quizzes when users want a fresh artifact despite matching fingerprints.
- [ ] Add richer diagnostics for low-signal study sources that are technically supported but weak for quiz generation.

## Product-Quality Follow-Ups

- [ ] Add a compact audit view for stale summaries and stale quizzes across all files.
- [ ] Add optional archive or cleanup actions for old attempts and derived study artifacts.
- [ ] Improve calendar interaction density on smaller screens without harming readability.
- [ ] Add a clearer local-data reset or maintenance flow in settings.

## Longer-Term Candidates

- [ ] Introduce export-first portability before considering any sync architecture.
- [ ] Revisit a desktop wrapper only if browser storage or background limits become a real blocker.
- [ ] Explore study-session prioritization using existing summaries, quizzes, reminders, and attempt history.
