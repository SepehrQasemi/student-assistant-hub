# UI Page Planning

## `/`

### Purpose

Redirect entry route to the working dashboard while keeping a stable home URL.

### Primary Components

- redirect or lightweight shell handoff

### Key User Actions

- open the application

### Future Enhancements

- optional landing or onboarding screen if export/sync features are added later

## `/dashboard`

### Purpose

Give the student an immediate overview of workload, recent activity, and upcoming reminders.

### Primary Components

- summary metric cards
- recent files panel
- upcoming deadlines panel
- upcoming exams panel
- reminder widget
- this-week events panel
- quick actions

### Key User Actions

- understand what matters now
- navigate quickly into files, courses, calendar, and settings

### Empty States

- no courses yet
- no files imported yet
- no upcoming events yet

## `/courses`

### Purpose

Manage courses locally and provide the academic structure that files and events can attach to.

### Primary Components

- course list
- create/edit course dialog
- delete confirmation
- responsive card layout

### Key User Actions

- create course
- edit course
- delete course

### Empty States

- guided message explaining why courses matter for file and calendar organization

## `/files`

### Purpose

Provide the core offline file workspace for importing, organizing, and previewing academic files.

### Primary Components

- file import panel
- search and filter controls
- list/grid view toggle
- file table or file cards
- file detail dialog
- preview panel

### Key User Actions

- import one or multiple files
- assign files to courses
- rename metadata
- add notes
- tag files
- filter and sort
- delete file

### Empty States

- no files imported yet
- filters produce no matching files

## `/calendar`

### Purpose

Manage local academic planning through multiple calendar views and event filters.

### Primary Components

- view switcher for day, week, month, quarter, and agenda
- filter controls
- event list or calendar surface
- create/edit event dialog
- event detail side panel or dialog

### Key User Actions

- create event
- edit event
- delete event
- assign event to course
- attach reminders
- switch views

### Empty States

- no events created yet

## `/settings`

### Purpose

Manage local app preferences and capability settings.

### Primary Components

- language selector
- notification preference controls
- calendar preference controls
- storage information section
- app information section

### Key User Actions

- switch language
- request notification permission
- choose default calendar view
- review local storage information

### Empty States

- not applicable beyond unset preferences
