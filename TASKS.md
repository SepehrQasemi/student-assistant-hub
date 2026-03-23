# Implementation Backlog

## Documentation Tasks

- [x] Define the product specification for Phase 1 through Phase 4.
- [x] Document the intended architecture and core data model.
- [x] Write page planning, user flows, and setup guidance.
- [ ] Keep documentation updated when implementation changes scope or architecture.

## Bootstrap Tasks

- [ ] Scaffold the Next.js app with TypeScript and Tailwind CSS in the existing structure.
- [ ] Add shadcn/ui and establish a consistent design baseline.
- [ ] Create shared app layout, route groups, and protected route structure.
- [ ] Add Supabase client setup for browser and server usage.
- [ ] Establish environment loading and runtime configuration checks.

## Auth Tasks

- [ ] Implement signup flow with validation and error handling.
- [ ] Implement login flow with session persistence.
- [ ] Create profile provisioning flow after user signup.
- [ ] Add protected routing for authenticated pages.
- [ ] Implement sign-out flow and session guard behavior.

## Course Module Tasks

- [ ] Create the courses table and row-level security policies.
- [ ] Implement course creation form and submission flow.
- [ ] Build the course list UI with empty states.
- [ ] Add course editing and archive behavior.
- [ ] Add course selectors for file and event forms.

## File Manager Tasks

- [ ] Create the files table and storage bucket conventions.
- [ ] Build file upload flow with metadata capture.
- [ ] Persist storage metadata only after successful upload.
- [ ] Implement file listing with pagination or bounded result loading.
- [ ] Add search by file title and filename.
- [ ] Add filters for course and category.
- [ ] Implement file edit actions for category and course assignment.
- [ ] Handle upload and metadata failure recovery cleanly.

## Calendar Tasks

- [ ] Create the events table and row-level security policies.
- [ ] Build the calendar page shell with a simple first view.
- [ ] Implement event creation and editing forms.
- [ ] Validate event time rules such as end after start.
- [ ] Add event filtering by course and type.
- [ ] Show upcoming events in chronological order.

## Reminder Tasks

- [ ] Create the reminders table and ownership rules.
- [ ] Implement reminder creation within the event workflow.
- [ ] Support common reminder offsets such as 15 minutes, 1 hour, and 1 day.
- [ ] Display configured reminders in event summaries.
- [ ] Surface upcoming reminders on the dashboard.
- [ ] Decide whether Phase 1 reminders are configuration-only or include initial delivery logic.

## Dashboard Tasks

- [ ] Build dashboard summary cards for courses, files, and upcoming events.
- [ ] Show a recent files section with useful metadata.
- [ ] Show upcoming reminders in a focused, low-noise list.
- [ ] Add quick actions for creating a course, uploading a file, and creating an event.
- [ ] Design first-use empty states that guide setup.

## Polish Tasks

- [ ] Add loading, error, and empty states across all primary pages.
- [ ] Apply consistent form validation and user feedback patterns.
- [ ] Add basic audit logging or activity timestamps where useful.
- [ ] Review accessibility for keyboard navigation and form labels.
- [ ] Prepare deployment configuration for Vercel.
- [ ] Write manual test cases for the Phase 1 critical flows.

## Future AI Tasks

- [ ] Design the summaries table and processing workflow.
- [ ] Define summary request and retry behavior.
- [ ] Design quiz and quiz question schemas.
- [ ] Define quiz generation boundaries and source traceability.
- [ ] Plan quiz interaction flows after generation is stable.
