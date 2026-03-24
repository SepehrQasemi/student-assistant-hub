# UI Pages

## Design Direction

The app is intentionally calm, minimal, and productivity-oriented. Phase 4 focused on consistency and usability rather than adding a new visual language.

Key Phase 4 UI goals:

- clearer spacing
- more stable dialog sizing
- better mobile and tablet behavior
- better handling of longer French labels
- cleaner hierarchy between primary and secondary actions

## `/`

### Purpose

- redirect to the active dashboard entry point

### Primary Components

- lightweight redirect handoff

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

### Responsive Notes

- stat cards stack cleanly on smaller widths
- quick actions wrap instead of clipping
- localized dates use compact formatting helpers

## `/courses`

### Purpose

- manage the course structure that the rest of the workspace attaches to

### Primary Components

- course list
- create/edit dialog
- delete flow
- color indicators

### Responsive Notes

- course cards remain readable on narrow widths
- form actions wrap rather than compressing

## `/files`

### Purpose

- act as the central product surface for the file workspace, summaries, and quizzes

### Primary Components

- import dialog
- search and filter toolbar
- grid/list toggle
- recent files panel
- file cards or list rows
- file detail dialog
- summary panel
- quiz panel

### Key User Actions

- import files
- assign or reassign courses
- edit metadata
- preview files
- generate summaries
- generate quizzes
- review history
- replace source files

### Responsive Notes

- filters stack instead of overflowing
- view toggles stay reachable on mobile
- metadata rows wrap cleanly
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

### Responsive Notes

- one-question-at-a-time flow keeps interaction manageable on smaller screens
- results and history stack vertically on narrower layouts
- long prompts and French review labels wrap instead of overflowing

## `/calendar`

### Purpose

- manage local events and reminders through calendar and agenda views

### Primary Components

- view switcher
- filters
- FullCalendar surface
- agenda list
- event form dialog

### Responsive Notes

- the calendar surface now uses an overflow container with a minimum content width
- controls remain usable on smaller screens instead of collapsing into unusable density
- agenda dates are localized through shared helpers

## `/settings`

### Purpose

- manage local preferences, notification behavior, storage visibility, and language

### Primary Components

- language controls
- notification controls
- calendar preferences
- storage information
- app info

### Responsive Notes

- settings cards stack vertically on smaller screens
- longer French labels remain readable without clipping
- the header language switcher and page-level settings controls remain visually distinct
