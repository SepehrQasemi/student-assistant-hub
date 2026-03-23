# Initial Decisions

## 1. Documentation-First Start

The repository starts with planning documents before application code. This reduces ambiguity and creates a stable reference for later implementation.

## 2. Phase 1 Is an Operational MVP, Not an AI MVP

The first implementation phase focuses on the academic workspace core:

- auth
- courses
- files
- calendar
- reminders
- dashboard

AI features are postponed until the core data model and user workflows are stable.

## 3. Supabase Is the Primary Backend Service

Supabase is the planned backend service for:

- authentication
- relational data
- file storage

This keeps the early product architecture compact while supporting secure ownership rules and future extensibility.

## 4. Files Are Modeled as Metadata Plus Storage Objects

Academic files must have a database record and a storage object. This separation is required for:

- searchable metadata
- course assignment
- category filtering
- future AI processing references

## 5. AI Artifacts Must Be Additive

Summaries and quizzes will be introduced as new domain tables instead of changing the meaning of course, file, or event records. This preserves the usefulness of the core workspace even if AI processing is unavailable.
