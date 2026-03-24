# Implementation Backlog

## Completed Foundations

- [x] Phase 1 offline-first workspace
- [x] Phase 2 local document extraction and summarization
- [x] Phase 3 local quiz generation, execution, scoring, review, and history

## Phase 3 Follow-Up Hardening

- [ ] Add manual regenerate controls for quizzes when users want a fresh artifact even if the current fingerprint and options already match a stored quiz.
- [ ] Add richer diagnostics for quiz generation failures caused by low-signal or sparse source material.
- [ ] Add broader quality fixtures for text-based PDF quiz generation.
- [ ] Add denser attempt-comparison controls when a quiz accumulates many retries.
- [ ] Add optional export of quiz history and attempt results.

## Phase 4 Preparation

- [ ] Use quiz attempt history to prioritize what should be reviewed next.
- [ ] Connect summaries, quizzes, and calendar deadlines more explicitly inside the study workflow.
- [ ] Design study-session orchestration around persisted summaries, quizzes, and attempts.
- [ ] Add QA datasets for validating future review recommendations against deterministic local inputs.

## Future Platform Work

- [ ] Add export and restore workflows for full local workspace portability.
- [ ] Design sync adapters only after export/import is stable.
- [ ] Evaluate a desktop wrapper only if browser storage or background limits become a blocking issue.
