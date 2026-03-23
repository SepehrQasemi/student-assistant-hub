# Setup Guide

## Current Repository State

This repository is currently in planning and foundation mode. It contains documentation, directory structure, and repository bootstrapping artifacts only. It does not yet contain a runnable Next.js application or installed dependencies.

The next implementation phase should scaffold the application into the existing structure and then connect the app to Supabase.

## Intended Local Setup Steps

When implementation begins, the recommended local setup flow is:

1. Install the required tools listed below.
2. Clone the repository.
3. Copy `.env.example` to a local environment file such as `.env.local`.
4. Create and configure the Supabase project.
5. Scaffold the Next.js application and install dependencies.
6. Add the Supabase integration and verify authentication.
7. Run the app locally and validate the Phase 1 pages.

## Required Tools

- Node.js 20 or newer
- npm, pnpm, or yarn
- Git
- GitHub CLI for repository operations, if GitHub workflows are used locally
- Supabase account and project access
- Vercel account for deployment in later steps

## Environment Variables

The intended environment variables for the first implementation phase are:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

See `.env.example` for the repository baseline.

## Future Supabase Setup Expectations

The first implementation should provision:

- a Supabase project
- authentication for user accounts
- Postgres tables for profiles, courses, files, events, and reminders
- storage buckets for academic files
- row-level security policies that isolate each user's data

Recommended expectations:

- keep auth and database ownership aligned through `user_id`
- create migrations under `supabase/` once the schema is introduced
- define storage naming conventions early to avoid later object path migrations

## Future Deployment Target

The intended deployment target is Vercel for the Next.js frontend, with Supabase providing backend services.

Expected deployment responsibilities:

- Vercel hosts the web application
- Supabase handles auth, database, and storage
- environment variables are set in both local and hosted environments

## Notes for the Next Build Phase

- do not introduce AI tooling during the initial scaffold
- implement the Phase 1 domain first
- keep the repo structure aligned with the documentation
- update the documentation if architectural choices materially change during implementation
