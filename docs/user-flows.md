# User Flows

## Create a Course

1. The user opens `/courses`.
2. The page shows either the existing course list or a first-use empty state.
3. The user selects the create action.
4. The course form validates name, code, semester, instructor, color, and optional notes.
5. The course is stored locally through the course repository.
6. The list updates immediately.

## Import Files and Assign to a Course

1. The user opens `/files`.
2. The user selects one or many local files.
3. The import panel optionally assigns a course and category before saving.
4. The file repository stores metadata and the blob locally.
5. The user sees the imported files in the active list or grid.
6. The user can open a file detail dialog to refine notes, tags, course assignment, or display name.

## Search, Filter, and Sort Files

1. The user enters a search term or selects filters.
2. File query logic applies search, course filter, category filter, file type filter, and sort order locally.
3. The view updates without any server roundtrip.
4. The user switches between list and grid modes depending on the screen or task.

## Preview a File

1. The user opens a file from the file workspace.
2. The app loads the local blob through the file repository.
3. If the file is a PDF, image, or plain text file, a preview is rendered.
4. If the file type is unsupported, the app shows honest fallback metadata instead of a fake preview.

## Create an Event with Reminders

1. The user opens `/calendar`.
2. The user creates an event and selects type, date, time, course, and notes.
3. The user adds one or many reminders using offsets or custom scheduled times.
4. The event repository stores the event locally.
5. The reminder repository stores the reminder records locally.
6. The calendar and upcoming reminder surfaces update.

## Manage Due Reminders

1. The reminder engine evaluates due reminders while the app is running.
2. When a reminder becomes due, the app creates an in-app notification record.
3. If browser notifications are enabled and allowed, the app also requests a browser notification.
4. The user opens the notification center.
5. The user dismisses, snoozes, or marks the related event as done.

## Review the Dashboard

1. The user opens `/dashboard`.
2. The dashboard aggregates local data into summary cards and priority sections.
3. The user reviews recent files, upcoming deadlines, exams, reminders, and this-week events.
4. The user uses quick actions to create the next course, event, or file import task.
