# Setup Guide

## Current Repository State

Student Assistant Hub is a fully local web application with Phases 1 through 4 implemented.

The repository includes:

- the offline-first workspace
- local extraction and summarization
- local quiz generation and review
- startup scripts
- verify tooling
- coverage reporting
- hardened responsive and bilingual UI

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- a modern browser with IndexedDB support

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
chmod +x RUN_ME_UNIX.sh STOP_UNIX.sh
./RUN_ME_UNIX.sh
```

Stop commands:

```powershell
./STOP_WINDOWS.ps1
```

```bash
./STOP_UNIX.sh
```

## Standard npm Workflow

```bash
npm install
npx playwright install
npm run dev
```

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

## Environment Variables

The app remains backend-free. No environment file is required for normal local development.

`.env.example` remains intentionally minimal and optional.

## Offline-First Expectations

- all primary product data is stored in IndexedDB
- extracted text, summaries, quizzes, attempts, and answers are also local
- clearing site data removes the local workspace
- browser quota still applies

## Supported Study Inputs

Supported:

- plain text files
- markdown files
- text-based PDFs

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

## Notes on Unix Script Verification

The Unix run path is provided and documented for shell-based environments. In this Windows-heavy development environment, the PowerShell and batch paths were directly exercised, while the Unix scripts were validated by inspection and kept aligned with the same direct `node ... next dev` startup approach.
