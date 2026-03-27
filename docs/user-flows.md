# User Flows

## Start the App Locally

1. The user runs one of the documented startup paths:
   - `RUN_ME_WINDOWS.bat`
   - `./RUN_ME_WINDOWS.ps1`
   - `bash RUN_ME_UNIX.sh`
2. The script checks for Node.js and npm.
3. The script installs dependencies if needed.
4. The script checks for a busy port.
5. The script launches the dev server and opens the browser when practical.
6. The user can later stop the script-managed server through the matching stop script.

## Check Local AI Readiness

1. The user runs `npm run ai:status`.
2. The script checks whether the configured Ollama endpoint is reachable.
3. The script checks whether `qwen3:4b` and `qwen3-embedding:0.6b` are installed.
4. The user gets a clear local readiness result before relying on summaries, quizzes, or smart import suggestions.

## Create and Manage Courses

1. The user opens `/courses`.
2. The user creates or edits a course with:
   - name
   - optional description
   - existing course metadata such as code, instructor, semester, color, and notes
3. The repository stores the course locally.
4. The user can delete a course if they intentionally want to remove that workspace structure.

## Create Course Folders

1. The user opens a course workspace at `/courses/[courseId]`.
2. The user creates a folder inside that course.
3. The user can create nested folders under an existing course folder.
4. The folder tree is stored locally and reused by manual upload and import confirmation.

## Manage My Drive Folders

1. The user opens `/files` and switches to `My Drive`.
2. The user can create nested drive folders and rename or move them by changing the parent folder.
3. The user can delete a drive folder tree from the same management dialog.
4. When a drive folder tree is deleted, files inside it are moved back to the drive root instead of keeping a stale folder link.

## Upload Files Directly Into a Course or Folder

1. The user opens `/files` or a course workspace.
2. The user launches the import dialog.
3. The user selects one or more local files.
4. The user selects:
   - either a course or the general drive
   - an optional folder inside that course or inside My Drive
   - category and notes
5. The repository stores file metadata, blob content, source fingerprint, and optional preserved relative path locally.
6. Files imported without a course remain in the general drive and can still be assigned to drive folders.
7. The assignment repository records the confirmed course or folder placement immediately only when the upload targets a course.

## Smart Import Mixed Files

1. The user opens `/files`.
2. The user starts the smart import flow.
3. The user selects multiple mixed files.
4. The app creates an import batch and stores each file locally without final course assignment.
5. The app extracts text, builds representations, and compares each file only against the user's existing courses.
6. The app returns review items with:
   - suggested course
   - alternate course
   - confidence
   - status
   - reason
7. If local analysis is unavailable, the review still opens with `unknown` items and explicit manual-review messaging.
8. The user reviews and overrides any item as needed.
9. The user confirms the batch.
10. Only then are final course and folder assignments persisted.

## Smart Import a Folder With Relative Paths

1. The user starts the smart import flow and chooses a folder selection.
2. The browser provides files with preserved relative paths.
3. The app stores the original relative paths in import metadata.
4. The assignment engine uses content as the main signal and the shared import-folder path only as a soft consistency signal.
5. During confirmation, the user can keep the preserved structure and let the app recreate matching course-local folders where reasonable.
6. Final assignment still requires explicit confirmation.

## Review Ambiguous Suggestions

1. The review dialog shows one line per imported file.
2. For each file the user can inspect:
   - filename
   - original relative path
   - suggested course
   - alternate course
   - confidence and status
   - explanation
   - destination folder
3. If the suggestion is weak or ambiguous, the item is marked `needs_review` or `unknown`.
4. The user can:
   - accept the suggestion
   - choose a different existing course
   - choose the destination folder
   - leave the file unassigned if the current UI permits that choice
5. The app does not auto-apply uncertain assignments.

## Open a Course Workspace

1. The user opens `/courses`.
2. The user selects `Open workspace` on a course card.
3. The app loads the course-scoped overview, folder tree, files, calendar, reminders, and study entry points.
4. File uploads opened from this workspace keep the current course preselected.
5. Folder creation and file organization remain scoped to the active course.

## Move Files To Trash

1. The user opens `/files`.
2. The user selects one or more visible files.
3. The user chooses `Move to trash`.
4. The app marks those files as trashed without immediately deleting their blobs or study artifacts.
5. Course views no longer show the trashed files while Trash keeps them available for recovery.

## Restore Or Permanently Delete Trashed Files

1. The user opens the `Trash` section inside `/files`.
2. The user reviews one or more trashed files.
3. The user can restore the file to its previous course or back to the general drive if the old course no longer exists.
4. The user can also choose permanent deletion.
5. Permanent deletion removes the stored blob and the file-linked derived artifacts.

## Generate a Summary

1. The user opens a file detail dialog from `/files` or from a course workspace.
2. The user switches to the `Summaries` tab.
3. The app checks the current file fingerprint and extraction state.
4. The ingestion service extracts and normalizes text when the file type is supported.
5. The summary service chunks long content when needed.
6. The app calls local Ollama and validates the structured JSON response.
7. Structured summaries try to cover all major concepts, while study notes expand into denser revision notes that can be read like a compact handout.
8. Summary history is stored locally and remains tied to the file fingerprint.
9. The user can regenerate a selected summary mode to create a fresh version while keeping the older history entry.
10. If the source later changes, older summaries remain visible but are marked stale.

Current product note:

- multi-file course study notes are archived from the course workspace for now; use the `Summaries` tab inside each file for summary and study-note generation

## Generate and Complete a Quiz

1. The user opens a supported file.
2. The user switches to the `Quizzes` tab.
3. The user selects quiz options:
   - question count
   - quiz mode
   - focus mode
   - include explanations
4. The app reuses current extracted content and summary artifacts for the same fingerprint.
5. The quiz service calls local Ollama and validates the structured JSON response.
6. The quiz is generated and stored locally.
7. The user starts the quiz from the file detail dialog.
8. The user answers questions inside `/quizzes/[quizId]`.
9. On submission, the app stores the attempt, answers, score, and review state.
10. The user can reopen the latest attempt or retry the quiz later.

## Generate a Course Quiz From Multiple Files

1. The user opens a course workspace.
2. The user switches to the `Quizzes` tab.
3. The user opens the course quiz panel.
4. The user chooses whether the quiz should use:
   - all files in the course
   - only selected files
5. If the user chooses selected files, the app opens a compact source picker instead of showing the whole file list inline.
6. The user can adjust the weight of each included file.
7. The app reuses current extracted content and summary artifacts for every included file.
8. The weighted source bundle is sent to local Ollama and validated before persistence.
9. The generated course quiz is stored locally with its source-file mix and weights.
10. The user can start the quiz immediately or reopen it later from course quiz history.
11. If one of the source files later changes, the stored course quiz becomes stale.

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

## Import a Calendar as a Local Copy

1. The user opens the global calendar page or a course workspace calendar tab.
2. The user opens the calendar import dialog.
3. The user chooses either an ICS file or a public calendar URL.
4. The app previews parsed events locally, including recurring occurrences within the bounded import window.
5. On import, the repository stores the resulting events as normal local events with lightweight provenance labels.
6. Re-importing the same source skips obvious duplicates by `sourceExternalId`.
7. If the browser cannot fetch a remote URL directly because of CORS, the app retries through its local same-origin runtime before falling back to a manual ICS download message.

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
