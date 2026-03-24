# Product Roadmap

## Roadmap Overview

The roadmap has been executed in a local-first order:

1. build a trustworthy offline workspace
2. add grounded document understanding
3. add grounded study quizzes
4. harden the product before any broader upgrade-oriented phase

## Phase 1: Offline-First Core Workspace

### Status

Completed

### Delivered Scope

- bilingual UI
- local Dexie persistence
- courses CRUD
- offline file manager
- calendar
- reminders and notification center
- dashboard
- settings

## Phase 2: Local Document Processing and Summarization

### Status

Completed

### Delivered Scope

- file type detection
- extraction for plain text, markdown, and text-based PDFs
- extraction status persistence
- normalization and chunking
- deterministic summary modes
- concept extraction
- summary history
- stale summary detection

## Phase 3: Local Quiz Generation, Execution, and Review

### Status

Completed

### Delivered Scope

- quiz generation from one supported file at a time
- deterministic multiple-choice and true/false questions
- quiz options for count, mode, focus mode, and explanations
- quiz persistence
- attempt persistence
- scoring and per-question review
- quiz history and retry flow
- stale quiz detection

## Phase 4: Hardening, Verification, and Product Cleanup

### Status

Completed

### Delivered Scope

- documentation audit and cleanup
- Windows and Unix startup scripts
- `npm run verify` and `npm run verify:full`
- coverage reporting and thresholds
- expanded unit, integration, component, and e2e tests
- responsive audit and targeted UI fixes
- English/French localization audit
- French wording and rendering cleanup
- final hardening report

### Rationale

Phase 4 exists to increase trust in the product foundation before any broader future phase. It deliberately focuses on:

- setup clarity
- verification clarity
- localization quality
- responsive usability
- stronger confidence in core workflows

## Post-Phase 4 Candidate Work

These are not completed and should remain clearly separated from shipped scope:

- export and restore for local workspace portability
- broader text-based PDF quality fixtures
- stronger stale-artifact maintenance tools
- study-session prioritization based on reminders, summaries, and attempts
- desktop-wrapper evaluation only if browser limitations become blocking

## Rationale for Ordering

1. The app needed a stable local workspace before document processing made sense.
2. Document processing needed to exist before grounded quiz generation could be added.
3. Quiz generation needed durable local artifacts before any broader study workflow could be trusted.
4. Hardening needed to happen before adding another domain so the current foundation became easier to run, easier to verify, and safer to build on.
