# User Flows

## Sign Up / Login

1. The user lands on `/` and sees the product overview and entry call-to-action.
2. The user selects `Log in` or `Sign up`.
3. On `/signup`, the user submits email and password details.
4. The system creates the auth account and initiates any email verification flow if enabled.
5. After successful account creation, the system provisions the user profile record.
6. The user is redirected to `/dashboard` or a first-use empty state.
7. Returning users go to `/login`, authenticate, and are redirected into their private workspace.
8. If authentication fails, the page shows a clear error without losing the form context.

## Create a Course

1. The signed-in user opens `/courses`.
2. The course list page shows existing courses or an empty state if none exist.
3. The user selects `Create course`.
4. The course form collects at minimum the course name, with optional code, term, color, and description.
5. The system validates required fields and creates the course under the current user.
6. The course list refreshes and the new course appears immediately.
7. The user can open the course context later to organize files and events around it.

## Upload Files and Assign to a Course

1. The user opens `/files`.
2. The user selects one or more academic files to upload.
3. The upload form captures metadata such as title, category, and optional course assignment.
4. The file is uploaded to Supabase Storage.
5. After storage succeeds, the system writes the file metadata record in the database.
6. The user sees the new file in the file list with its category and course label.
7. If the user skipped course assignment during upload, the file remains visible in an unassigned state until edited.

## Browse / Search / Filter Files

1. The user opens `/files`.
2. The page loads files owned by the authenticated user.
3. The user enters a search term to filter by title or original filename.
4. The user optionally filters by course and file category.
5. The system updates the list and reflects active filters in the UI.
6. If no results match, the page shows a clear filtered empty state and an option to reset filters.
7. The user opens a file record for metadata review or editing.

## Create an Event

1. The user opens `/calendar`.
2. The page shows an event list or calendar view, depending on the chosen initial implementation.
3. The user selects `Create event`.
4. The event form captures title, event type, date and time, optional end time, optional course link, location, and description.
5. The system validates required fields and date consistency.
6. The event is saved to the database.
7. The calendar view refreshes and the new event appears in chronological order.

## Add Reminders to an Event

1. The user creates a new event or opens an existing event from `/calendar`.
2. Inside the event form or event detail panel, the user adds one or more reminder rules.
3. Each reminder captures a timing offset such as `15 minutes before` or `1 day before`.
4. The system stores the reminder configuration linked to the event.
5. The UI displays the configured reminders as part of the event summary.
6. Upcoming reminders can later surface on the dashboard and in event detail views.

## Review Dashboard Overview

1. The user logs in and lands on `/dashboard`.
2. The dashboard loads personalized summary widgets.
3. The user sees upcoming events ordered by date.
4. The user sees near-term reminders derived from configured event reminders.
5. The user sees recent files and high-level counts such as total courses or files.
6. The user uses dashboard shortcuts to navigate into files, courses, or calendar views.
7. If the account is new and empty, the dashboard shows guided empty states that direct the user to create a course, upload a file, or add an event.
