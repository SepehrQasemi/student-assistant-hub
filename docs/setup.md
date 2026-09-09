# Setup

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

No Ollama service, model download, API key, or cloud database is required.

## Validation

```bash
npm run verify
```

This runs lint, unit/component tests, and the production build. For browser tests, install Playwright Chromium and run:

```bash
npx playwright install chromium
npm run verify:full
```

## Local data

Workspace data lives in IndexedDB for the current browser profile. Use the in-app export before clearing site data or moving to another browser. Treat exports as private because they can include user-added course and file metadata.
