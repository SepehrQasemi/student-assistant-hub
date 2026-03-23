# Setup Guide

## Current Repository State

This repository now targets a fully local Phase 1 implementation. The application does not require any backend service, cloud storage, or authentication provider to run.

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

The workspace stores application data in IndexedDB. No additional service is required.

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

Phase 1 does not require backend credentials.

The `.env.example` file is intentionally minimal and exists only for optional display-level configuration. The app should still run without any custom environment file.

## Offline-First Expectations

- all primary application data is stored in IndexedDB
- the app remains usable without cloud services
- browser storage quotas still apply
- clearing site data will remove the local workspace unless backup/export is added in a future phase

## Notifications

Browser notifications are optional and depend on:

- user permission
- browser support
- the app being able to execute reminder checks

They are helpful but not guaranteed like native background notifications.

## Future Deployment Direction

The app can be deployed like a normal Next.js application later, but Phase 1 does not depend on any hosted backend. The main persistence boundary remains local Dexie repositories.
