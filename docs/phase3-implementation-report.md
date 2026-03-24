# Phase 3 Implementation Report

## 1. Executive Summary

Phase 3 is implemented as a fully local quiz-generation and review layer on top of the existing offline-first workspace and Phase 2 document-processing foundation.

The application can now:

- derive quiz source material from extracted documents, summary sections, and concept artifacts
- generate deterministic local quizzes for one supported file at a time
- support multiple-choice, true/false, and mixed quiz modes
- persist quizzes, questions, attempts, and answers in IndexedDB
- let the user complete quizzes inside the app
- calculate scores and store per-question review data
- reopen quiz history and prior attempts later
- detect stale quizzes when the source file changes

No cloud service, remote AI API, or paid inference dependency was introduced.

## 2. Completed Scope

Completed Phase 3 scope:

- quiz source selection from Phase 2 artifacts
- deterministic candidate selection
- deterministic distractor generation for MCQs
- true/false generation using controlled statement mutation
- quiz generation options for question count, mode, focus mode, and explanations
- quiz persistence
- question persistence
- attempt persistence
- answer persistence
- score calculation
- results and review flow
- quiz history by file
- attempt history by quiz
- stale quiz detection using file content fingerprints
- bilingual English and French UI coverage for Phase 3
- automated unit, repository/service, component, and end-to-end tests

## 3. Architecture Updates

Phase 3 extends the existing layered architecture with three new service boundaries:

- quiz source selection
- deterministic quiz generation
- scoring and review retrieval

The UI remains orchestration-only. Candidate selection, question generation, answer normalization, evaluation, stale detection, and persistence all remain outside page components.

Main implementation layers:

- `components/files/file-quiz-panel.tsx`
- `components/quizzes/quiz-session-page-client.tsx`
- `app/quizzes/[quizId]/page.tsx`
- `lib/services/quiz-source-service.ts`
- `lib/services/question-candidate-service.ts`
- `lib/services/distractor-generator.ts`
- `lib/services/quiz-generator.ts`
- `lib/services/answer-normalizer.ts`
- `lib/services/quiz-evaluator.ts`
- `lib/services/document-quiz-service.ts`
- `lib/services/quiz-review-service.ts`
- `lib/repositories/quiz-repository.ts`
- `lib/repositories/quiz-attempt-repository.ts`

## 4. New Libraries Used and Why

No new external libraries were required for Phase 3.

Phase 3 reuses the existing stack:

- Dexie for local persistence
- the existing Phase 2 extraction and summarization services
- Vitest and Testing Library for automated testing
- Playwright for end-to-end verification

## 5. Data Model Extensions

The Dexie schema was extended with:

- `quizzes`
  - stores quiz headers and generation options
- `quizQuestions`
  - stores persisted generated questions
- `quizAttempts`
  - stores start/completion timestamps and aggregate scores
- `quizAnswers`
  - stores per-question answers and correctness

The existing `files`, `extractedDocuments`, `summaries`, `summarySections`, and `summaryConcepts` tables remain the upstream source for quiz generation.

## 6. Quiz Generation Strategy

Phase 3 uses a deterministic local generation approach rather than model-based reasoning.

Generation flow:

1. load the current extracted document for the file fingerprint
2. gather supporting summary sections and concepts for the same fingerprint
3. build section-aware source material from normalized text, headings, concepts, and summary artifacts
4. select strong quiz candidates from repeated concepts, definition-like lines, and review-oriented statements
5. generate question objects in the selected mode
6. persist the quiz and questions locally

Focus modes:

- `balanced`
  - mixes concept-heavy and explanatory source statements
- `key_concepts`
  - prioritizes repeated or heading-weighted terms
- `review`
  - prioritizes revision-style or emphasis-like statements

## 7. Question Type Support

Implemented question types:

- `multiple_choice`
- `true_false`

Quiz modes:

- `multiple_choice`
- `true_false`
- `mixed`

Short-answer is intentionally deferred. The current local-only boundary is good enough for controlled option-based scoring, but not strong enough to claim robust short-answer grading.

## 8. Persistence Model Summary

Generated quizzes are stored locally and linked to:

- `sourceFileId`
- `extractedDocumentId`
- `sourceFingerprint`
- `mode`
- `focusMode`
- `includeExplanations`
- question rows in `quizQuestions`

Attempts are stored separately in `quizAttempts`, and per-question answers are stored in `quizAnswers`.

This keeps generated study artifacts reusable and lets the UI reopen history without regenerating content.

## 9. Stale Quiz Handling Summary

Stale detection is based on `sourceFingerprint`.

Rules:

- each imported or replaced file stores a content fingerprint
- each quiz stores the fingerprint used at generation time
- a quiz is stale when `quiz.sourceFingerprint !== file.contentFingerprint`

Old quizzes remain visible in history. The UI marks them stale instead of hiding them, and the user can generate a fresh quiz from the updated source.

## 10. UI Integration Summary

Phase 3 is integrated into the existing file workflow and adds a focused quiz route.

Implemented UI areas:

- file detail dialog
  - new `Quizzes` tab
  - generation controls
  - extraction readiness messaging
  - quiz history list
  - stale and current badges
  - direct links to start a quiz or reopen the latest attempt
- dedicated quiz route
  - `/quizzes/[quizId]`
  - start screen
  - question player
  - answer controls
  - results and review
  - attempt history
  - retry flow

## 11. i18n Summary

All Phase 3 UI strings were added to both English and French dictionaries, including:

- quiz generation actions
- mode labels
- focus mode labels
- score and results labels
- answer labels
- stale and current badges
- insufficient-content and missing-source messages
- history and attempt labels
- retry and submit actions

Stored quiz prompts and explanations are not machine-translated. UI labels are localized, while generated quiz content stays in the source document language.

## 12. Test Strategy

Phase 3 testing was added at several levels:

- unit tests for quiz source selection, candidate generation, distractor logic, question generation, scoring, and stale handling
- repository and service integration tests for quiz persistence, attempt persistence, reuse, and stale detection
- component tests for quiz generation UI and quiz player or review flows
- end-to-end tests for the full supported-file quiz workflow

## 13. Tests Added

New unit and integration tests:

- `tests/unit/quiz-source-service.test.ts`
- `tests/unit/question-candidate-service.test.ts`
- `tests/unit/distractor-generator.test.ts`
- `tests/unit/quiz-generator.test.ts`
- `tests/unit/quiz-evaluator.test.ts`
- `tests/unit/quiz-repository.test.ts`
- `tests/unit/document-quiz-service.test.ts`

New component tests:

- `tests/components/file-quiz-panel.test.tsx`
- `tests/components/quiz-session-page-client.test.tsx`

New end-to-end test:

- `tests/e2e/phase3-quiz.spec.ts`

## 14. Commands Run

Commands run during implementation and verification:

```bash
npm run lint
npm run test
npm run build
npx playwright test tests/e2e/phase3-quiz.spec.ts
npm run test:e2e
```

## 15. Test Results

Final verified results:

- `npm run lint`
  - passed
- `npm run test`
  - passed
- `npm run build`
  - passed
- `npm run test:e2e`
  - passed

Verified workflows in this environment:

- generate a quiz from a supported markdown file
- complete a persisted quiz
- view score and explanations
- reopen quiz history and latest attempt
- replace the source file and verify stale quiz state
- switch the UI to French and verify the Phase 3 flow remains usable

## 16. Manual QA Checklist

- import a `.txt` or `.md` file and generate quizzes in each supported mode
- verify the same quiz options reuse the current quiz for the same file fingerprint
- verify explanations appear only when the option is enabled
- complete a quiz and verify score, correct count, and incorrect count
- reopen older attempts from quiz history
- replace a source file and verify the stale badge appears
- switch from English to French and verify Phase 3 labels change
- reload the app and verify quiz history remains accessible in the same browser profile

## 17. Responsive Behavior Notes

- quiz generation controls stack into a single-column layout on smaller widths
- the file-level history and viewer panels remain readable on tablet and mobile sizes
- the dedicated quiz route keeps one-question-at-a-time interaction to reduce overflow on smaller screens
- results and attempt-history cards stack vertically on narrower layouts

## 18. Known Limitations

- quiz generation currently works from one file at a time
- supported question types are limited to multiple-choice and true/false
- short-answer grading is intentionally deferred
- question quality depends on the strength and structure of the extracted source material
- generated prompts and explanations remain in the source document language
- text-based PDF quiz generation depends on the underlying extraction quality from Phase 2

## 19. Implementation Tradeoffs

- quiz generation is deterministic and heuristic so it can be tested and kept local, but it is less flexible than cloud LLM generation
- stale detection uses content fingerprints instead of timestamps so metadata-only edits do not invalidate study artifacts
- the quiz route is separate from the file detail dialog because running attempts and reviewing results inside the modal would have made the interaction cramped on smaller screens
- short-answer was deferred rather than weakened into a misleading feature

## 20. Suggested Next Steps

- add a manual regenerate action for users who want a fresh quiz despite matching current options
- broaden text-based PDF quiz fixtures to tighten quality checks
- use attempt history in Phase 4 to guide what the student should review next
