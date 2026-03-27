# Setup Guide

## Current Repository State

Student Assistant Hub is a fully local web application with:

- offline-first course, folder, file, calendar, and reminder workflows
- local document extraction
- local Ollama-backed smart import suggestions
- local Ollama-backed summaries and quizzes
- startup scripts
- verify tooling
- coverage reporting
- hardened responsive and bilingual UI

Current product note:

- file-level summaries and study notes are available in each file detail dialog
- course-level multi-file study notes are archived from the current UI until stronger local model quality is available

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- a modern browser with IndexedDB support
- Ollama installed locally for AI-backed features

For e2e tests:

```bash
npx playwright install
```

## Fastest Run Paths

### Windows double-click

- `RUN_ME_WINDOWS.bat`

### Windows PowerShell

```powershell
./RUN_ME_WINDOWS.ps1
```

### Unix-like shell

```bash
bash RUN_ME_UNIX.sh
```

Stop commands:

```powershell
./STOP_WINDOWS.ps1
```

```bash
bash STOP_UNIX.sh
```

## Standard npm Workflow

```bash
npm install
npx playwright install
npm run dev
```

## Local AI Setup

Required models:

- `qwen3:4b`
- `qwen3-embedding:0.6b`

The repo includes a local readiness check:

```bash
npm run ai:status
```

It verifies:

- the configured Ollama endpoint is reachable
- the text model exists
- the embedding model exists

## Environment Variables

The app does not require backend credentials.

For local AI behavior, the optional environment variables are:

- `OLLAMA_BASE_URL`
- `OLLAMA_TIMEOUT_MS`
- `OLLAMA_RETRY_COUNT`

Example defaults are provided in `.env.example`.

## Verification Commands

### Main verification

```bash
npm run verify
```

This runs:

- `npm run lint`
- `npm run test`
- `npm run build`

### Full verification

```bash
npm run verify:full
```

This runs:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

Playwright starts a dedicated `next start` server on `http://127.0.0.1:3100`, so full verification does not collide with a normal dev server on port `3000`.

### Coverage

```bash
npm run coverage
```

Coverage output is written under `coverage/`.

Current global thresholds:

- lines: `72`
- statements: `72`
- functions: `72`
- branches: `62`

## What the Startup Scripts Do

The startup scripts are intentionally simple. They:

- check Node.js
- check npm
- install dependencies if `node_modules` is missing
- detect an obvious port-3000 conflict
- start the Next.js dev server
- open the browser where practical
- store a PID file for the matching stop script

The Windows scripts also write local dev logs beside the project root.

## Offline-First Expectations

- all primary product data is stored in IndexedDB
- extracted text, course profiles, embeddings, summaries, quizzes, attempts, and answers are also local
- clearing site data removes the local workspace
- browser quota still applies

## Supported Study Inputs

Supported:

- plain text files
- markdown files
- text-based PDFs
- DOCX
- PPTX

Not supported:

- scanned or image-only PDFs
- OCR-dependent inputs
- audio or video
- essay-style grading

## Notification Limits

Browser notifications are optional and honest:

- they depend on permission
- they depend on browser support
- they are not guaranteed when the browser is closed or heavily suspended

## Notes on Test AI Mode

The end-to-end test suite uses a deterministic mock AI mode so browser-flow tests stay stable and do not depend on live Ollama responses.

Normal development and normal runtime behavior still use the real local Ollama endpoint.
