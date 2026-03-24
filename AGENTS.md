# Agent Guidance

This repository is an offline-first student workspace. Coding agents must preserve that architecture unless the user explicitly changes the product direction.

## Required Working Rules

- Read the relevant docs before making substantial changes.
- Respect the current roadmap phase.
- Do not add backend or cloud dependencies unless the product direction explicitly changes.
- Do not add remote AI or paid inference services for Phase 2.
- Produce a short plan before major edits.
- Summarize changed files after each task.
- Provide manual verification steps after each task.
- Keep the repository, service, and persistence boundaries clean.

## Architecture Rules

- Pages and feature components must not write to IndexedDB directly.
- Persistence must go through repositories.
- Reminder scheduling must stay behind a dedicated engine or service layer.
- Document extraction and summary generation must stay in services, not inside UI components.
- User-facing strings must be sourced from the i18n layer.
- File preview and summarization logic must remain honest about unsupported formats.

## Quality Rules

- Avoid giant components with mixed responsibilities.
- Prefer small, domain-aligned modules with clear names.
- Keep responsive behavior intentional, not accidental.
- Add tests for new behavior rather than relying on manual confidence.
- Update docs when architecture, runtime limits, or product behavior changes.
- When adding new summary artifacts, make them reusable for future quiz generation instead of burying them in UI state.
