# User Flows

## Start the App Locally

1. The user runs one of the documented startup paths:
   - `RUN_ME_WINDOWS.bat`
   - `./RUN_ME_WINDOWS.ps1`
   - `./RUN_ME_UNIX.sh`
2. The script checks for Node.js and npm.
3. The script installs dependencies if needed.
4. The script checks for a busy port.
5. The script launches the dev server and opens the browser when practical.
6. The user can later stop the script-managed server through the matching stop script.

## Import Files and Assign a Course

1. The user opens `/files`.
2. The user launches the import dialog.
3. The user selects one or more local files.
4. The user optionally selects a course and category before saving.
5. The repository stores metadata, blob content, and source fingerprint locally.
6. The user sees the file in the workspace and can refine notes, tags, or course assignment later.

## Generate a Summary

1. The user opens a file detail dialog from `/files`.
2. The user switches to the `Summaries` tab.
3. The app checks the current file fingerprint and extraction state.
4. The ingestion service extracts and normalizes text when the file is supported.
5. The summary service generates deterministic summary artifacts for the selected mode.
6. Summary history is stored locally and remains tied to the file fingerprint.
7. If the source later changes, older summaries remain visible but are marked stale.

## Generate and Complete a Quiz

1. The user opens a supported file from `/files`.
2. The user switches to the `Quizzes` tab.
3. The user selects quiz options:
   - question count
   - quiz mode
   - focus mode
   - include explanations
4. The quiz services reuse current extracted content and summary artifacts for the same fingerprint.
5. A quiz is generated and stored locally.
6. The user starts the quiz from the file detail dialog.
7. The user answers questions inside `/quizzes/[quizId]`.
8. On submission, the app stores the attempt, answers, score, and review state.
9. The user can reopen the latest attempt or retry the quiz later.

## Replace a Source File and Detect Stale Study Artifacts

1. The user opens a file record.
2. The user replaces the local source file while keeping the same file record.
3. The file repository updates the blob and content fingerprint.
4. Existing summaries and quizzes remain visible in history.
5. Any summary or quiz whose fingerprint no longer matches the current file fingerprint is marked stale.
6. The user can generate fresh study artifacts from the updated source.

## Create an Event and Reminder

1. The user opens `/calendar`.
2. The user creates or edits an event.
3. The user adds one or more reminders.
4. Reminder records are stored locally.
5. The reminder engine can surface in-app notifications and optional browser notifications when supported.
6. The dashboard and notification center reflect the updated upcoming state.

## Switch Language and Persist Settings

1. The user changes the language from the shell switcher or the settings page.
2. The locale updates immediately through the i18n provider.
3. The selected locale is stored in local settings.
4. After reload, the app returns in the same language.
5. Calendar and date rendering use the locale-aware formatting helpers where implemented.

## Verify the Project

1. The user runs `npm run verify`.
2. The script runs:
   - lint
   - tests
   - build
3. If the user needs full browser-flow verification, they run `npm run verify:full`.
4. The user can run `npm run coverage` to inspect coverage output and reports.
