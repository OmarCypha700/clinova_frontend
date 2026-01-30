
# ClinOva - Nursing Practical Assessment App (Frontend)

A frontend version of a nursing practical assessment app. Built with Next,js, Tailwind CSS, Shadcn UI, and a Django backed. Designed as the UI for administrators and examiners workflows.

## Key Features

- Multi-section admin UI: programs, students, examiners, procedures, grades
- Examiner assessment workflow
- Reusable UI `shadcn ui`
- Authentication
- PWA support via `next-pwa`

## Tech Stack

- Next.js (App Router)
- Lucid React (icons)
- Tailwind CSS
- Shadcn UI

## Repository Layout (important files)

- `app/` — Next.js App Router pages and route groups
- `components/` — app-level components and dialogs
- `components/ui/` — shadcn ui components
- `hooks/useAuth.js` — authentication helper
- `lib/api.js` — centralized API helper (axios)
- `utils.js` — utility helpers
- `public/manifest.json` — PWA manifest

## Prerequisites

- Node.js 18+ (recommended)
- npm or Yarn

## Environment

Create a `.env.local` in the project root (not checked into git) with values your backend expects. Typical variables:

- `NEXT_PUBLIC_API_URL` — base API URL for `lib/api.js`
- `NEXTAUTH_URL` or other auth endpoints if applicable

Example `.env.local`:

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Install

Install dependencies:

```bash
npm install
# or
yarn
```

## Available Scripts

Scripts are defined in `package.json`:

- `dev` — run Next.js in development mode
- `build` — build for production
- `start` — start the production server
- `lint` — run ESLint

Run development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
npm start
```


## Routing Overview

The app uses the Next.js App Router under `app/`. Notable routes:

- `/admin` — admin dashboard and sub-areas
- `/programs` — program list and program-specific routes
- `/programs/[programId]` — program details; contains `students/` and nested pages
- `/programs/[programId]/students/[studentId]` — student dashboard, `careplan/`, `procedures/`
- `/programs/[programId]/students/[studentId]/procedures/[procedureId]/reconcile` — procedure reconcile flow

Explore `app/` to see the full route structure.

## Components & UI

The `components/ui/` folder contains shadcn ui components. Use these to keep UI consistent:

- Buttons, inputs, selects, dialog, table, avatar, etc.

Top-level components in `components/` include the `Navbar`, `ChangePasswordDialog`, and `DashboardSkeleton`.

## API Client

`lib/api.js` centralizes API calls using `axios`. Configure the base URL via `NEXT_PUBLIC_API_URL` and add interceptors for auth tokens where needed.

## Authentication

There is a `useAuth` hook that encapsulates auth-related state and helpers. Adjust it to match your backend auth mechanisms (JWT, session cookie, OAuth, etc.).

## PWA

`next-pwa` is installed and configured — see `next.config.mjs` for options. Check `public/manifest.json` if you change icons or manifest properties.

## Styling

Tailwind CSS is used for styling; configuration is in `tailwind.config.js`. Utility classes and the `components/ui` primitives implement the design system.

## Contributing

- Fork the repo and create a feature branch
- Keep changes focused and small
- Run lint before submitting PR: `npm run lint`

If you add new pages or UI primitives, update this `README.md` and consider adding examples in `components/` or story-like demo pages.

## Troubleshooting

- If styles don't load, ensure Tailwind is configured and `globals.css` is imported in `app/layout.js`.
- If API calls fail, confirm `NEXT_PUBLIC_API_URL` and CORS on the backend.

## License & Contact

This project does not include a license file. Add a `LICENSE` if you plan to open-source.

For questions or help, open an issue or contact the maintainers.

---
## Demo

#### [Demo App](https://nursingpractical.vercel.app/)
#### Administrator Credentials 
- *username:* administrator
- *password:* admin@123

#### Examiner Credentials 
**Examiner 1**
- *username:* yp
- *password:* yp@1234

**Examiner 2**
- *username:* cypha
- *password:* cypha@1234

*This is a `Dual Examiner` form of assessment*

### Note: This repo will go private very soon 😉
