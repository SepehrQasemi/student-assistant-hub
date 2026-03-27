# UI Pages

## Design Direction

The app is intentionally calm, minimal, and productivity-oriented.

Current UI goals:

- clear organization across courses, folders, files, and study actions
- explicit review states instead of hidden automation
- responsive layouts that survive longer French labels
- a clear separation between organization flows and study-generation flows

## Global Shell

### Purpose

- keep global navigation and cross-page controls out of the main content column

### Primary Components

- fixed desktop sidebar navigation
- notification center pinned near the top of the desktop sidebar
- language switcher pinned near the bottom of the desktop sidebar
- compact mobile utility controls when the sidebar is hidden

## `/`

### Purpose

- redirect to the active dashboard entry point

## `/dashboard`

### Purpose

- give the student an immediate view of workload and near-term priorities

### Primary Components

- stat cards
- recent files
- upcoming deadlines
- upcoming exams
- upcoming reminders
- events this week
- quick actions

## `/courses`

### Purpose

- manage the course structure that the rest of the workspace attaches to

### Primary Components

- course list
- create and edit dialog
- delete flow
- open-workspace action
- color indicators
- optional course description field

## `/courses/[courseId]`

### Purpose

- give each course a dedicated workspace without duplicating file, calendar, summary, or quiz pipelines

### Primary Components

- course info card
- course-scoped folder tree
- course-scoped file section
- course-scoped calendar section
- course-scoped `Quizzes` tab for multi-file quiz generation
- locked course upload flow

### Key User Actions

- create nested course folders
- upload files directly into the active course or a selected folder
- browse files grouped by folder structure
- trigger file-level summary actions from stored files
- trigger course-level quiz actions from the dedicated quiz tab

## `/files`

### Purpose

- act as the central product surface for file organization, smart import review, summaries, and quizzes

### Primary Components

- manual import dialog
- smart import dialog
- import review dialog
- drive-style sidebar with all files, My Drive, course shortcuts, and Trash
- search and filter toolbar
- bulk selection toolbar
- file list rows with location metadata
- file detail dialog
- summary panel
- quiz panel

### Key User Actions

- import files into a chosen course and optional course folder
- keep files in a general drive when they should not belong to a course
- import a full folder while preserving relative paths
- run smart import against existing courses only
- review confidence and ambiguity before confirmation
- override course and folder decisions
- select multiple files and move them to Trash
- restore trashed files or delete them permanently
- edit metadata
- preview files
- generate summaries
- generate quizzes
- review history
- replace source files

### Responsive Notes

- filters stack instead of overflowing
- import review tables remain readable on smaller widths
- file detail dialog switches to a single-column flow earlier to reduce crowding

## `/quizzes/[quizId]`

### Purpose

- provide a focused surface for taking and reviewing quizzes

### Primary Components

- start card
- question player
- answer controls
- results and review
- attempt history
- stale badge

## `/calendar`

### Purpose

- manage local events and reminders through calendar and agenda views

### Primary Components

- sticky filter and action sidebar
- week-first navigation toolbar
- view switcher
- full-height FullCalendar surface
- agenda list
- event form dialog
- calendar import dialog

## `/settings`

### Purpose

- manage local preferences, notification behavior, storage visibility, language, and AI readiness

### Primary Components

- language controls
- notification controls
- calendar preferences
- storage information
- local AI status card
- app info

### Key User Signals

- whether Ollama is reachable
- whether the text and embedding models are available
- whether local AI-backed study features should work without extra setup
