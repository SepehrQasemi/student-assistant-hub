# User Flows

## Import Files and Assign to a Course

1. The user opens `/files`.
2. The user selects one or many local files.
3. The import panel optionally assigns a course and category before saving.
4. The file repository stores metadata, the blob, and the initial content fingerprint locally.
5. The user sees the imported files in the active list or grid.
6. The user can open a file detail dialog to refine notes, tags, course assignment, or display name.

## Preview a File

1. The user opens a file from the file workspace.
2. The app loads the local blob through the file repository.
3. If the file is a PDF, image, or plain text file, a preview is rendered.
4. If the file type is unsupported for preview, the app shows honest fallback metadata instead of a fake preview.

## Generate a Summary for a Supported File

1. The user opens a file from `/files`.
2. The user switches to the summary area in the file detail flow.
3. The app checks the file type and current extraction state.
4. The user selects a summary mode such as quick summary or structured summary.
5. The ingestion service loads the local blob, detects the document type, and extracts text where supported.
6. The extracted text is normalized and chunked.
7. The summarization service generates deterministic summary artifacts and key concepts.
8. The summary repository stores the summary, sections, and concept records locally.
9. The user sees the resulting summary and can reopen it later from history.

## Handle Unsupported or Failed Extraction

1. The user attempts to summarize a file.
2. The ingestion service detects an unsupported format or fails to extract usable text.
3. The extracted-document repository stores an explicit status such as `unsupported`, `failed`, or `empty`.
4. The UI shows a specific message describing what happened.
5. The user is not shown a fake summary for unsupported or broken input.

## Revisit Summary History

1. The user opens a file that already has summary history.
2. The summary view lists previous summaries by mode and creation time.
3. The user selects an older summary.
4. The UI renders the stored summary sections and concept list from local persistence.
5. The UI indicates whether the selected summary is current or stale relative to the current file fingerprint.

## Detect Stale Summaries After Source Replacement

1. The user opens an existing file record.
2. The user replaces the source file content while preserving the record.
3. The file repository stores the new blob and recomputes the content fingerprint.
4. Existing summaries remain in history.
5. Any summary whose stored fingerprint no longer matches the current file fingerprint is marked stale.
6. The user can generate a fresh summary from the updated source.

## Review the Dashboard

1. The user opens `/dashboard`.
2. The dashboard aggregates local data into summary cards and priority sections.
3. The user reviews recent files, upcoming deadlines, exams, reminders, and this-week events.
4. The user uses quick actions to navigate toward course creation, file import, or calendar work.
