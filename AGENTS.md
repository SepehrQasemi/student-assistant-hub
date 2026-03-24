# Agent Guidance

This repository is a hardened offline-first student workspace. Agents are expected to preserve that architecture and keep changes grounded in the implemented product.

## Required Working Rules

- Read the relevant docs before making substantial changes.
- Respect the current roadmap state instead of treating the repo like a greenfield prototype.
- Keep the app offline-first and local-first unless the user explicitly changes the product direction.
- Do not add backend, sync, cloud storage, or remote AI dependencies without an explicit product change.
- Produce a short implementation plan before major edits.
- Summarize changed files after each task.
- Provide manual verification steps after each task.
- Update docs when behavior, architecture, setup, or limitations change.

## Architecture Rules

- Pages and feature components must not write to IndexedDB directly.
- Persistence must go through repositories.
- Core logic belongs in services, not inside route components or dialogs.
- Document extraction, summarization, quiz generation, scoring, reminder logic, and notification logic must stay in service layers.
- User-facing strings must go through the i18n layer.
- Stale detection must remain fingerprint-based rather than timestamp-only.
- Reuse existing extracted documents, summary artifacts, quiz artifacts, and attempt history instead of creating parallel pipelines.

## Quality Rules

- Prefer small, domain-aligned modules over mixed-responsibility files.
- Avoid fake placeholders for unsupported behavior.
- Keep unsupported or degraded states honest in the UI.
- Preserve responsive usability on mobile, tablet, laptop, and desktop layouts.
- Keep English and French translations synchronized.
- Avoid introducing inconsistent terminology across the two dictionaries.

## Verification Rules

- Run `npm run verify` for normal product changes.
- Run `npm run verify:full` when a change can affect browser flows.
- Run `npm run coverage` when modifying critical logic or widening test scope.
- Do not claim startup improvements unless the run scripts were actually exercised.
- Do not claim localization quality unless both English and French strings were checked.
- Do not claim remote state unless git and GitHub were both verified.

## Startup and Tooling Rules

- Keep `RUN_ME_WINDOWS.bat`, `RUN_ME_WINDOWS.ps1`, `RUN_ME_UNIX.sh`, `STOP_WINDOWS.ps1`, and `STOP_UNIX.sh` working.
- Keep `scripts/verify.mjs` aligned with the documented verification flow.
- Avoid adding tooling that makes the local run path harder to understand.

## Documentation Rules

- README must describe the current implemented product, not a planning-stage idea.
- Historical phase reports may keep phase-specific details, but they must not misrepresent the current repo state.
- Separate completed work from future suggestions clearly.
