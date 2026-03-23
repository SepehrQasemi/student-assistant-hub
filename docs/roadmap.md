# Product Roadmap

## Roadmap Overview

The roadmap is intentionally sequenced so the product first becomes a dependable student operations hub, then adds AI-driven study assistance on top of stable data structures.

## Phase 1: Core Workspace

### Goal

Deliver a secure, usable academic workspace covering the main organizational jobs a student must perform regularly.

### Scope

- authentication and session management
- course management
- file upload and categorization
- file search and filtering
- calendar event management
- reminder configuration
- dashboard overview

### Expected Outcomes

- one authenticated workspace per student
- a coherent relationship between courses, files, events, and reminders
- enough product structure to support later AI features without schema churn

### Milestones

- M1: repository and documentation foundation
- M2: Next.js app scaffold and design system baseline
- M3: Supabase authentication and protected routing
- M4: course CRUD and dashboard shell
- M5: file upload, listing, search, and filtering
- M6: calendar events and reminder configuration
- M7: Phase 1 QA, polish, and deployment hardening

## Phase 2: AI Summaries

### Goal

Generate useful study summaries from academic files without changing the core workspace model.

### Scope

- summary jobs attached to stored files
- summary status tracking and result persistence
- summary viewing inside file detail or course context
- failure handling and retry behavior

### Expected Outcomes

- a student can request an AI summary for supported material
- summaries are stored and can be revisited
- the system separates generated artifacts from source files cleanly

### Milestones

- M1: summary-ready file processing design
- M2: summary generation workflow and storage model
- M3: summary UI integration
- M4: prompt quality, error handling, and guardrails

## Phase 3: AI Quiz Generation

### Goal

Turn course materials and summaries into structured quiz content that helps exam preparation.

### Scope

- quiz generation requests tied to files, summaries, or courses
- quiz persistence with question records
- quiz metadata such as topic, difficulty, and source linkage

### Expected Outcomes

- a student can generate a quiz from selected study material
- generated quiz content is stored and traceable to its source
- quiz artifacts can be reused in future study sessions

### Milestones

- M1: quiz domain schema and generation workflow
- M2: question model and validation rules
- M3: quiz listing and detail views
- M4: generation quality tuning and cost controls

## Phase 4: Quiz Interaction and Extended Study Workflow

### Goal

Turn generated quiz content into an active study loop with review and progress signals.

### Scope

- quiz-taking experience
- answer capture and feedback
- study history and completion tracking
- future expansion into recommendations or spaced review

### Expected Outcomes

- a student can interact with generated quizzes inside the app
- quiz attempts become part of a broader study workflow
- the app begins to function as a study assistant, not only an organizer

### Milestones

- M1: quiz session UX
- M2: answer evaluation and result tracking
- M3: study history surfaces
- M4: extended review workflow design

## Rationale for Ordering

The roadmap follows a dependency-first sequence:

1. The product needs trusted user data, file storage, and event organization before AI can produce anything useful.
2. Summaries come before quizzes because quiz generation should operate on stable source material and, ideally, on normalized summary artifacts.
3. Quiz interaction comes after quiz generation because it depends on the existence of persistent question data.

This order reduces rework, lowers delivery risk, and keeps the MVP grounded in real student utility even if AI features arrive later than expected.
