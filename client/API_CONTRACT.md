# Backend handoff for the SkillSpring frontend

This is the contract consumed by this client. It describes the previously implemented core API; it is not a claim that the current remote `main` backend already supports these routes. The backend teammate should implement this contract or coordinate corresponding changes in `src/lib/api.ts`, `src/lib/types.ts`, and the requesting pages.

## Transport and authentication

- Base path: `/api`. Requests use `credentials: 'include'` and `X-Requested-With: SkillSpring`.
- Use a revocable HttpOnly session cookie. The frontend does not store a JWT or password in localStorage. `/auth/me` returns HTTP 401 when signed out.
- JSON writes use `Content-Type: application/json`. Uploads use `FormData`; let the browser supply the multipart boundary.
- Roles are exactly `student` and `company`; the UI labels `company` as Business.
- Return string `id` fields, not only MongoDB `_id`. Nested task/company/student objects must match `src/lib/types.ts`. Timestamps are ISO strings. Optional arrays should be empty arrays rather than missing values where the types require them.
- Errors use `{ "error": { "code": "validation_error", "message": "Explain the problem.", "details": [{ "path": "email", "message": "Use a valid address." }] } }`. `details` is optional. Use appropriate 400/401/403/404/409/413/429/5xx status codes.
- The local frontend origin is `http://127.0.0.1:5173`; permit it for CSRF/origin checks. Keep production UI and API on the same origin with secure cookies. Backend permissions and private download checks are mandatory even if the UI hides an action.

## Endpoints used by the client

Every path below is relative to `/api`. `User`, `Task`, `AssignmentDetail`, and other response types are defined in `src/lib/types.ts`.

| Method and path                                | Request                                                           | Successful response                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `POST /auth/register`                          | `{ email, password, first_name, last_name, role, company_name? }` | `{ user: User }` and session cookie                                                                 |
| `POST /auth/login`                             | `{ email, password }`                                             | `{ user: User }` and session cookie                                                                 |
| `GET /auth/me`                                 | None                                                              | `{ user: User }`                                                                                    |
| `POST /auth/logout`                            | None                                                              | 204; revoke session                                                                                 |
| `GET /tasks`                                   | Query: `q`, `category`, `difficulty`, `page`                      | `{ items: Task[], total, page, pages }`                                                             |
| `GET /tasks/:id`                               | None                                                              | `{ task: Task }`                                                                                    |
| `POST /tasks`                                  | Task fields below                                                 | `{ task: Task }`                                                                                    |
| `GET /my/tasks`                                | None                                                              | `{ items: Task[] }` for owner                                                                       |
| `POST /tasks/:id/close`                        | None                                                              | 204                                                                                                 |
| `POST /tasks/:id/proposals`                    | `{ message, estimated_hours }`                                    | `{ proposal: Proposal }`                                                                            |
| `GET /my/proposals`                            | None                                                              | `{ items: Proposal[] }` for student                                                                 |
| `GET /tasks/:id/proposals`                     | None                                                              | `{ items: Proposal[] }` for task owner                                                              |
| `POST /tasks/:id/proposals/:proposalId/select` | Client sends `{ id: proposalId }`; selected ID is in path         | `{ assignment: Assignment }`                                                                        |
| `POST /tasks/:id/files`                        | Multipart `file` containing a ZIP                                 | `{ file: FileAsset }`                                                                               |
| `GET /tasks/:id/files`                         | None                                                              | `{ items: FileAsset[] }` for owner                                                                  |
| `GET /assignments`                             | None                                                              | `{ items: Assignment[] }` for current participant                                                   |
| `GET /assignments/:id`                         | None                                                              | `AssignmentDetail` with `assignment`, `agreement`, `files`, `submissions`, `reviews`, `validations` |
| `POST /assignments/:id/agreement`              | `{ accepted: true, accepted_name, version: 1 }`                   | `{ agreement: Agreement }`                                                                          |
| `POST /assignments/:id/submissions`            | Multipart `file` ZIP and optional `notes`                         | `{ submission: Submission, validation: ValidationRun }`                                             |
| `POST /submissions/:id/reviews`                | `{ decision, feedback, rating?, public_summary? }`                | `{ review: Review }`                                                                                |
| `GET /files/:id/download`                      | Cookie-authenticated browser download                             | Authorized ZIP attachment                                                                           |
| `GET /profiles/me`                             | None                                                              | `ProfileResponse` with `user`, `profile`, `experiences`                                             |
| `GET /profiles/:id`                            | Public user ID in path                                            | `ProfileResponse` with public fields only                                                           |
| `PATCH /profiles/me`                           | Profile fields below                                              | `ProfileResponse`                                                                                   |
| `POST /profiles/me/verification`               | `{ evidence }`                                                    | `{ request }`; pending manual review                                                                |
| `POST /profiles/me/password`                   | `{ current_password, password }`                                  | 204; rotate sessions                                                                                |
| `DELETE /profiles/me`                          | `{ password, confirmation: "DELETE" }`                            | 204; revoke sessions                                                                                |

The client uses the direct download link with session cookies; downloads do not have the custom fetch header. Apply the custom-header requirement to mutations, not browser download links.

## Fields and workflow rules

Registration requires a password of 10–72 characters and at most 72 UTF-8 bytes, names of 1–80 characters, and `company_name` for the `company` role. Enforce input validation on the server even though forms apply basic browser constraints.

Task creation sends `title`, `description`, `acceptance_criteria`, `category`, `difficulty`, `skills` (string array), `estimated_hours` (integer), `agreement_required` (boolean), and `agreement_text` (string). Categories: `ui`, `api`, `data`, `component`, `script`, `poc`. Difficulties: `easy`, `medium`, `hard`. Hours: 1–500. A proposal message is 30–6,000 characters.

Only the owning company can select a proposal. Selection creates one assignment and snapshots agreement terms. Assignment states consumed by the UI are `awaiting_agreement`, `in_progress`, `submitted`, `changes_requested`, `validation_failed`, `completed`, and `rejected`. Without an agreement requirement, the selected assignment starts in progress. Selection and approval must be atomic and protected against duplicate requests.

Agreement acceptance requires `accepted: true`, a typed name, and the current immutable version. Starter downloads stay unavailable until agreement acceptance when required.

Uploads are ZIPs, up to 8 MB, with a README. The original API validates archive safety and integrity without executing code. Return an actual validation record with `status` (`passed` or `failed`), `findings` (string array), `file_count`, `uncompressed_bytes`, and `execution: "not_run"`. Failed checks permit resubmission. Do not fabricate a passing record or mark Docker execution successful. The core API's optional sandbox endpoint returns 501; this client does not launch a sandbox.

`AssignmentDetail.submissions` must be newest-first because the review panel uses the first entry as the latest version. Reviews use `decision: "approved" | "changes_requested" | "rejected"`, feedback of at least 10 characters, and, for approval, integer `rating` from 1 to 5 plus a public summary. Approval creates exactly one verified-experience record for that assignment. Requesting changes permits another submission; rejection closes the work.

Profile updates always send `first_name` and `last_name`. Student fields are `bio`, `university`, `github_url`, `graduation_year`, and `skills`. Company fields are `name`, `description`, and `website`. Verification requests send evidence of 20–2,000 characters and must not self-grant verified status. Verification states are `unverified`, `pending`, `verified`, `rejected`.

The account-deletion UI states that identity is anonymized, sessions are revoked, and project history is retained. Refuse deletion while unresolved assignments exist, or coordinate a changed UI policy with the frontend owner.

## Integration check with your teammate

1. Start the API; point `API_PROXY_TARGET` in the client's local `.env` to its origin. Restart Vite.
2. Register a Business and a Student in separate browser profiles or sign out between roles.
3. As Business, post a task and, if needed, add private files and agreement text.
4. As Student, find the task and submit a proposal.
5. As Business, select that proposal. As Student, accept the agreement and download allowed files.
6. Submit a ZIP. As Business, request changes, receive a new version, then approve with a rating.
7. Check that the Student profile shows exactly one verified-experience entry and that another user cannot download private files.

Frontend-only tests use controlled HTTP responses. Successful frontend tests and compilation do not substitute for this real integration check against your team's API.
