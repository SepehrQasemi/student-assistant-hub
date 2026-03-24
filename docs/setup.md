# Setup Guide

## Current Repository State

This repository targets an offline-first application with:

- Phase 1 local workspace features implemented
- Phase 2 local document extraction and summarization implemented for supported formats
- Phase 3 local quiz generation, execution, scoring, review, and history implemented on top of Phase 2 artifacts

The application does not require any backend service, cloud storage, or remote inference provider to run.

## Required Tools

- Node.js 20 or newer
- npm 10 or newer
- a modern Chromium-based browser, Firefox, or Safari with IndexedDB support
- Playwright browsers for end-to-end tests, if running the E2E suite

If Playwright browsers are not installed yet, run:

```bash
npx playwright install
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local app in your browser.

The workspace stores application data in IndexedDB. No backend or extra local service is required.

## Test Commands

Unit and component tests:

```bash
npm run test
```

Linting:

```bash
npm run lint
```

End-to-end tests:

```bash
npm run test:e2e
```

Production build:

```bash
npm run build
```

## Environment Variables

The application remains backend-free in Phase 3.

The `.env.example` file remains intentionally minimal and exists only for optional display-level configuration. The app should run without any custom environment file.

## Offline-First Expectations

- all primary application data is stored in IndexedDB
- extracted text, summaries, quizzes, attempts, and answers are also stored locally
- the app remains usable without cloud services
- browser storage quotas still apply
- clearing site data removes the local workspace and all derived study artifacts

## Document Processing Limits

- summarization and quiz generation only support plain text, markdown, and text-based PDFs
- scanned or image-only PDFs are not treated as supported study inputs
- extraction quality depends on the structure embedded in the source file
- local summaries and quizzes are heuristic and deterministic, not cloud-model reasoning

## Quiz Workflow Limits

- quizzes are generated from one supported file at a time
- current question types are multiple-choice and true/false
- short-answer is intentionally deferred because the current local-only evaluation model is not strong enough to claim robust grading
- quizzes are only as current as the source fingerprint they were generated from

## Notifications

Browser notifications are optional and depend on:

- user permission
- browser support
- the app being able to execute reminder checks

They are helpful but not guaranteed like native background notifications.

## Future Deployment Direction

The app can be deployed like a normal Next.js application later, but it does not depend on any hosted backend. The main persistence boundary remains local Dexie repositories and all Phase 2 and Phase 3 artifacts are stored locally beside existing workspace data.
