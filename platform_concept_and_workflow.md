# Platform Concept and Workflow

> **Status:** Working product flow for the team. Source of truth for data is `db_schema.sql`.

## Platform Overview

The platform is a technical micro-task marketplace that connects verified college students with companies.

Companies post small, bounded technical tasks from their development backlog. Verified students browse these tasks, submit proposals, and, once selected, complete the work locally. Companies review the submitted work and decide whether to approve it.

The goal is to give students real, verifiable experience on actual company work without giving them access to a company's private repository, production systems, or infrastructure.

## Roles

The platform has two roles, stored in `users.role` as `user_role`:

- `student`
- `company`

A user's role is set at registration and does not change.

## Accounts and Verification

Every user has a row in `users` (email, password hash, first name, last name, role).

Students and companies each have a profile table (`students`, `companies`) linked one-to-one to `users`. Each profile has a `verification_status` of `unverified` or `verified`, which starts as `unverified`.

Verified profiles can use marketplace features:

- Verified students can browse tasks, submit proposals, and submit completed work.
- Verified companies can publish tasks and select students.

Unverified users can create their profile, but cannot publish tasks (companies) or submit proposals (students).

## Student Profile

`students` stores:

- `name`
- `bio`
- `github_url`
- `university`
- `graduation_year`
- `verification_status`

Experience on the platform is not stored as its own table. It comes from completed assignments, their reviews, and their ratings.

## Company Profile

`companies` stores:

- `name`
- `website`
- `description`
- `verification_status`

## Tasks

A company creates tasks in `tasks`:

- `title`
- `description`
- `difficulty`: `easy`, `medium`, `hard`
- `estimated_hours`
- `task_type`: `ui`, `api`, `data`, `component`, `script`, `poc`
- `status`: `open`, `assigned`, `in_progress`, `submitted`, `completed`, `closed`, `cancelled`

A task starts as `open`.

## Task Assets

Companies attach files to a task in `task_assets`. Each asset has:

- `original_filename`
- `stored_filename`
- `file_type`: `csv`, `json`, `script`, `component`, `readme`, `figma_link`, `api_spec`

Each asset can have one AI analysis in `ai_file_analysis`: detected type, recommended filename and folder, confidence score, risk level, security status, and findings.

Companies should attach only the files a student needs to complete the task, not their whole repository.

## Sandbox

Each task can have one sandbox in `sandboxes`: a stored zip (`zip_path`) and the template used (`template_used`).

## Proposals

Students submit a proposal for a task in `proposals`:

- `message`
- `estimated_hours`
- `status`: `pending`, `accepted`, `rejected`

A student can submit only one proposal per task.

## Assignment

The company selects one student per task. This creates a row in `assignments` with `student_id`, `assigned_at`, and an optional `deadline`. A task has at most one assignment.

Only the assigned student works on the task's files.

## Submissions

The assigned student submits completed work in `submissions`:

- `submission_zip_path`
- `github_url` (optional)
- `notes` (optional)
- `submitted_at`

## Reviews

The company reviews a submission in `reviews`:

- `status`: `approved`, `changes_requested`, `rejected`
- `feedback`
- `reviewed_at`

A submission has at most one review.

## Ratings

After an assignment, the company can rate the student in `ratings`: a `rating` from 1 to 5 and an optional `comment`. An assignment has at most one rating.

## Current End-to-End Flow

**Student registers → profile verified → company registers → profile verified → company creates task (`open`) → company attaches assets → students submit proposals → company selects one student (`assigned`) → student submits work (`submitted`) → company reviews (`approved`, `changes_requested`, or `rejected`) → task `completed` → company rates the student.**

## Core Platform Boundary

The platform is designed around bounded technical work.

It is not intended to give students access to company repositories, production databases, production credentials, internal infrastructure, or unrelated proprietary systems.

Companies decide which tasks to externalize and which task files to provide to the assigned student.
