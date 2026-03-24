# UI Page Planning

## `/`

### Purpose

Redirect entry traffic to the active dashboard while keeping a stable home URL.

### Primary Components

- redirect or lightweight shell handoff

## `/dashboard`

### Purpose

Give the student an immediate overview of workload, recent activity, reminders, and recent file activity.

### Primary Components

- summary metric cards
- recent files panel
- upcoming deadlines panel
- upcoming exams panel
- reminder widget
- this-week events panel
- quick actions

### Future Enhancements

- highlight recently generated summaries if they prove useful enough for the dashboard

## `/courses`

### Purpose

Manage courses locally and provide the academic structure that files and events attach to.

### Primary Components

- course list
- create/edit course dialog
- delete confirmation
- responsive card layout

## `/files`

### Purpose

Provide the core offline file workspace for importing, organizing, previewing, and now summarizing supported academic files.

### Primary Components

- file import panel
- search and filter controls
- list/grid view toggle
- file table or file cards
- file detail dialog
- preview panel
- summary tab or summary viewer inside the file detail flow
- summary history list

### Key User Actions

- import one or multiple files
- assign files to courses
- rename metadata
- add notes and tags
- replace a file source while preserving the record
- run a summary mode on a supported file
- inspect extraction status
- revisit prior summaries
- see stale summary warnings

### Empty States

- no files imported yet
- filters produce no matching files
- selected file has no summaries yet
- selected file is unsupported for summarization

### Future Enhancements

- dedicated summary comparison views if summary history becomes dense

## `/calendar`

### Purpose

Manage local academic planning through multiple calendar views and event filters.

### Primary Components

- view switcher for day, week, month, quarter, and agenda
- filter controls
- event list or calendar surface
- create/edit event dialog
- event detail side panel or dialog

## `/settings`

### Purpose

Manage local app preferences and capability settings.

### Primary Components

- language selector
- notification preference controls
- calendar preference controls
- storage information section
- app information section

### Future Enhancements

- export and backup settings once local portability work begins
