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

## Generate a Quiz for a Supported File

1. The user opens a file from `/files`.
2. The user switches to the quiz area in the file detail flow.
3. The app checks the file type and the current extracted-document state for the active file fingerprint.
4. The user selects quiz options:
   - question count
   - mode
   - focus mode
   - include explanations
5. The quiz source service loads extracted text and supporting summary artifacts for the same file version.
6. Candidate selection chooses strong concept and sentence targets from the source material.
7. The quiz generator produces deterministic multiple-choice and or true/false questions.
8. The quiz repository stores the quiz and question rows locally.
9. The user can start the quiz immediately or reopen it later from file history.

## Complete a Quiz and Review Results

1. The user opens a generated quiz from the file detail dialog.
2. The app routes the user to `/quizzes/[quizId]`.
3. The user starts a new attempt.
4. The user answers questions sequentially inside the quiz player.
5. The quiz evaluator normalizes answers and checks them against persisted correct answers.
6. The attempt repository stores the final attempt and answer rows.
7. The user sees:
   - score
   - correct count
   - incorrect count
   - their answer
   - the correct answer
   - explanation when the quiz was generated with explanations enabled

## Revisit Quiz History

1. The user opens a file that already has quiz history.
2. The quiz panel lists previous quizzes by mode, focus mode, creation time, and attempt summary.
3. The user selects a stored quiz.
4. The UI renders the persisted quiz metadata and quick access to the latest attempt or a new retry.
5. The user can reopen older attempts later from the dedicated quiz route.

## Detect Stale Summaries and Quizzes After Source Replacement

1. The user opens an existing file record.
2. The user replaces the source file content while preserving the record.
3. The file repository stores the new blob and recomputes the content fingerprint.
4. Existing summaries and quizzes remain in history.
5. Any summary or quiz whose stored fingerprint no longer matches the current file fingerprint is marked stale.
6. The user can generate fresh study artifacts from the updated source.

## Handle Unsupported or Insufficient Quiz Input

1. The user attempts to generate a quiz for a file.
2. The quiz workflow checks the existing extraction state and available source material.
3. If the file is unsupported, empty, failed, or too weak for the requested question count, the UI shows a specific message.
4. The app does not generate fake quiz content from missing or low-signal input.

## Review the Dashboard

1. The user opens `/dashboard`.
2. The dashboard aggregates local data into summary cards and priority sections.
3. The user reviews recent files, upcoming deadlines, exams, reminders, and this-week events.
4. The user uses quick actions to navigate toward course creation, file import, or calendar work.
