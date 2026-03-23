# Agent Guidance

This repository is documentation-first. Coding agents must treat the documentation as the source of truth until implementation begins.

## Required Working Rules

- Read `README.md` and the relevant files under `docs/` before making code changes.
- Respect the current roadmap phase. Do not implement Phase 2, Phase 3, or Phase 4 features during Phase 1 work.
- Do not add AI features early. Summaries, quizzes, and study workflows are explicitly deferred.
- Produce a short plan before making substantial edits.
- Summarize changed files after each task.
- Provide manual verification steps for anything you change.
- Avoid introducing unrelated dependencies.
- Preserve clean architecture boundaries between `app/`, `components/`, `lib/`, `types/`, and `supabase/`.

## Scope Discipline

- Keep Phase 1 focused on auth, courses, files, calendar, reminders, and dashboard behavior.
- Treat reminder configuration as in scope, but do not silently expand into complex notification infrastructure unless the task explicitly requires it.
- Keep future AI entities additive and isolated from the core domain.

## Architecture Discipline

- Use the stack documented in `docs/architecture.md` unless the user explicitly approves a change.
- Keep Supabase-specific access code out of presentational UI components.
- Prefer small, domain-oriented modules over large mixed-responsibility files.
- Update documentation when architecture, data model, or scope decisions change.

## Change Hygiene

- Do not create broad scaffolding or dependencies that the repository does not need yet.
- Do not rewrite existing structure without checking how it affects the documented plan.
- Keep naming consistent with the controlled values and domain terminology in `docs/data-model.md`.
- If a task exposes a contradiction in the docs, fix the documentation alongside the code or clearly report the conflict.
