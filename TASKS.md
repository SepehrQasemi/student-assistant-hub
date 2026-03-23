# Implementation Backlog

## Phase 1 Completed

- [x] Rewrite the documentation set for an offline-first, backend-free Phase 1.
- [x] Scaffold Next.js App Router, Tailwind CSS, reusable UI primitives, Dexie, i18n, and test infrastructure.
- [x] Implement bilingual English and French UI switching with persisted language preference.
- [x] Implement local courses CRUD with validation and color-linked usage across the app.
- [x] Implement offline file import, local blob storage, metadata editing, notes, tags, previews, filters, sorting, and recent files.
- [x] Implement local calendar event CRUD with day, week, month, quarter, and agenda views.
- [x] Implement reminder scheduling, in-app notification center actions, browser notification permission flow, and local reminder persistence.
- [x] Implement dashboard summaries, quick actions, and settings for language, notifications, calendar defaults, and storage visibility.
- [x] Add unit, component, and end-to-end test coverage for critical Phase 1 workflows.

## Near-Term Follow-Up

- [ ] Add export and backup workflows for local data safety.
- [ ] Add import and restore workflows for moving between browsers or devices.
- [ ] Improve dense-calendar mobile interactions after real usage feedback.
- [ ] Add richer bulk actions in the file manager once export and backup exist.
- [ ] Add duplicate detection heuristics for repeated file imports.

## Future Sync and Platform Work

- [ ] Design a sync adapter boundary that preserves the current repository contracts.
- [ ] Add conflict-handling rules before introducing optional online sync.
- [ ] Evaluate a desktop wrapper only if browser storage or notification limits become a blocking issue.

## Future AI Phases

- [ ] Add AI summaries only after the offline-first core remains stable and well tested.
- [ ] Add AI quiz generation as an additive study feature, not as a replacement for local organization.
- [ ] Add quiz interaction workflows after summaries and quiz generation are proven useful.
