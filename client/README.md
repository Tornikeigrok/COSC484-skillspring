# SkillSpring frontend

This folder is the complete React/TypeScript frontend for SkillSpring. It can be installed, built, and tested from `client/` without installing root or server dependencies. Use Node.js 24 or newer and npm. All commands below run inside this folder unless stated otherwise.

## What is included

- Responsive Figma-based landing page and shared typography, colors, buttons, cards, form fields, statuses, dialogs, and navigation.
- Student and Business workspaces, task discovery/details, proposals and student selection, assignments, agreement acceptance, ZIP submission, archive-result display, business review, profiles, verification requests, and settings.
- React Router routes, typed API utilities, TanStack Query caching/mutations, loading/error/empty states, and frontend tests.
- Local Inter fonts installed through npm. No separately downloaded Figma asset or private image is required.

The supplied Figma file exposed the landing frame at implementation time. The other screens extend its design tokens; they are not claimed as verified matches to unseen frames.

## Add these files to GitHub using the browser

1. Extract `SkillSpring_Client_Only.zip`. Open its `client` folder until you see `src`, `package.json`, and `vite.config.ts`.
2. On GitHub, open `Tornikeigrok/COSC484-skillspring`, select `main`, and open the existing `client` folder.
3. Click **Add file → Upload files**.
4. Drag everything **inside** the extracted `client` folder into the upload area. Include `src` and the configuration files. Do not drag the outer `client` folder into the existing `client` folder; that would create `client/client`.
5. Use commit message **Build SkillSpring frontend and connected product screens**. Select **Create a new branch for this commit and start a pull request**, and name it `feat/skillspring-frontend`. If that name already exists, use a new frontend branch name.
6. Open the pull request against `main`. Title: **Implement SkillSpring frontend**. State that the PR changes only `client/` and needs the API described in `API_CONTRACT.md`.
7. Inspect **Files changed**: paths should start with `client/`. Have the team review before merging.

Upload from the clean extracted package **before** installing dependencies. Do not upload `node_modules`, `dist`, real `.env` files, or this ZIP itself. The source package contains no backend or database changes. If your team has edited `client/` since the original placeholder, compare those edits in the PR before replacing them.

## Run on Windows

Open the extracted `client` folder in File Explorer. Type `powershell` into its address bar and press Enter. Run:

```powershell
node --version
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Open **http://127.0.0.1:5173**. Leave that terminal running. Press Ctrl+C to stop it. `npm.cmd` avoids PowerShell's `npm.ps1` execution-policy issue; on macOS/Linux use `npm` and `cp` instead.

If you already have the repository on your computer, back up your existing `client` folder outside the repository, then copy this package's `client` contents into the repository's `client` folder. Keep a local `.env` you already configured, and run the commands from that folder. Root and server files do not need to be replaced for the frontend handoff.

## What works without a backend

The landing page and login/register forms render with only Vite running. Frontend tests, typecheck, lint, and production compilation also run without a backend.

Accounts, task lists, dashboards, proposals, assignments, private downloads, review decisions, and profile data require a running backend that implements the contract in [API_CONTRACT.md](API_CONTRACT.md). Without it, data screens show an error or cannot authenticate. Copying the client does not create those server endpoints. Landing-page sample tasks are labeled illustrative.

No demo authentication, simulated persisted work, automatic identity verification, or Docker execution is added. A validation screen reports archive checks separately from code execution, which is unavailable in the supplied core implementation.

## Connect your teammate's API

Keep these values in your local `client/.env` when the API runs on port 3001:

```dotenv
VITE_API_URL=/api
API_PROXY_TARGET=http://127.0.0.1:3001
```

If the teammate uses a different port, change only `API_PROXY_TARGET` to the backend origin. It must not include `/api`; the proxy forwards that part of the request path automatically. Restart Vite after changing environment variables. Ask the backend teammate to permit `http://127.0.0.1:5173` as the frontend origin and implement cookie authentication and the documented response shapes.

`API_PROXY_TARGET` is read by the development server. `VITE_API_URL` is included in the browser bundle. Never put a MongoDB URI, API secret, password, or private key in any client file or `VITE_` variable.

## Frontend checks

```powershell
npm.cmd run check
```

This runs strict TypeScript checking (including Vite/Vitest configuration), Oxlint with warnings treated as failures, all frontend tests, and the production build. Tests control their HTTP responses; they do not prove that a separately implemented backend is compatible. The full earlier implementation was also exercised end to end with its own backend, but that server and its browser suite are outside this frontend-only package.

`npm.cmd run build` produces `dist/`. `npm.cmd run preview` previews the built UI. The Vite development proxy is not a production hosting configuration. Hosting needs an SPA fallback to `index.html` for frontend routes and a same-origin `/api` route to the backend. Coordinate that with the backend/deployment owner.

## Where to edit

| File or directory                     | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `src/pages/LandingPage.tsx`           | Public landing page                                        |
| `src/index.css`                       | Design tokens, typography, shared styles, responsive rules |
| `src/components/ui.tsx`               | Buttons, cards, fields, dialogs, statuses, shared UI       |
| `src/components/TaskCard.tsx`         | Reusable opportunity card                                  |
| `src/layouts/AppLayout.tsx`           | Student/Business navigation and signed-in route guards     |
| `src/App.tsx`                         | Route table and error boundary                             |
| `src/pages/`                          | Product screens and forms                                  |
| `src/lib/api.ts`                      | API base URL, requests, errors, private download URLs      |
| `src/lib/types.ts`                    | Shared frontend response types                             |
| `src/lib/queries.ts`                  | TanStack Query helpers                                     |
| `src/lib/auth.ts`                     | Current-session query                                      |
| `src/test/` and `src/lib/api.test.ts` | Frontend flow and request tests                            |
| `vite.config.ts` and `.env.example`   | Local API proxy and environment setup                      |

## Routes

| Routes                                                                                 | Screen/access                                        |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `/`                                                                                    | Landing, public                                      |
| `/login`, `/register`                                                                  | Authentication forms, public                         |
| `/tasks`, `/tasks/:id`, `/profiles/:id`                                                | Discovery, task detail, public profile               |
| `/student`, `/student/proposals`, `/tasks/:id/propose`                                 | Student workspace and proposals                      |
| `/business`, `/business/tasks`, `/business/tasks/new`, `/business/tasks/:id/proposals` | Business workspace, posting and selection            |
| `/assignments`, `/assignments/:id`                                                     | Participant work and assignment detail               |
| `/assignments/:id/agreement`, `/assignments/:id/submit`                                | Agreement and submission                             |
| `/assignments/:id/review`, `/assignments/:id/validation`                               | Review and archive results                           |
| `/profile`, `/verification`, `/settings`                                               | Signed-in profile, verification request and settings |

Replace `:id` with a real ID returned by the backend. Protected screens require a real signed-in session. Client route guards help navigation; the backend must enforce every permission independently.

References: [GitHub file uploads](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), [Vite environment configuration](https://vite.dev/guide/env-and-mode.html).
