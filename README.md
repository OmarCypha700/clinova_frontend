
# ClinOva - Nursing Practical Assessment App (Frontend)

A comprehensive digital platform designed specifically for nursing and midwifery educators to manage clinical and practical evaluations at Nursing Training Colleges. ClinOva streamlines the assessment process with an intuitive interface for administrators and examiners.

Built with Next.js, Tailwind CSS, Shadcn UI, and a Django backend, ClinOva provides a modern, mobile-responsive solution for managing nursing practicals and clinical assessments.

## Key Features

- **Dual Examiner Assessment System** — Streamlined evaluation workflow with multiple examiners
- **Program & Student Management** — Create, manage, and track nursing programs and student progress
- **Procedure Assessment Tracking** — Document and monitor clinical procedure competencies
- **Grades & Progress Management** — Track grades, performance metrics, and student achievements
- **Secure Authentication** — Role-based access control for students, examiners, and administrators
- **Mobile-Responsive Design** — Access assessments on any device with PWA support
- **Real-time Dashboard** — Quick overview of ongoing assessments and student performance
- **Care Plan Management** — Students can create and manage clinical care plans
- **Procedure Reconciliation** — Standardized assessment reconciliation between examiners

## Tech Stack

- **Frontend**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS + Shadcn UI components
- **Icons**: Lucide React
- **Backend**: Django REST API
- **Database**: SQL
- **Deployment Ready**: PWA support with `next-pwa`

## Repository Layout (Important Files)

- `app/` — Next.js App Router pages and route groups
  - `admin/` — Administrator dashboard and management areas
  - `programs/` — Program listings and details
  - `students/` — Student profiles and care plan areas
- `components/` — Reusable app-level components
  - `Navbar.jsx` — Main navigation
  - `ChangePasswordDialog.jsx` — Password management
  - `DashboardSkeleton.jsx` — Loading state component
- `components/ui/` — Shadcn UI (button, input, table, dialog, etc.)
- `hooks/useAuth.js` — Authentication state management and helpers
- `lib/api.js` — Centralized Axios API client
- `lib/utils.js` — Utility helper functions
- `public/manifest.json` — PWA manifest configuration

## Use Cases

### For Administrators
- Set up and manage nursing programs
- Add examiners and students to programs
- Define assessment procedures and competencies
- View comprehensive reports and progress analytics
- Manage grades and official records

### For Examiners
- Access student assessment queue
- Record clinical procedure competencies
- Provide real-time feedback
- Collaborate with co-examiners on reconciliation


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

- `dev` — run Next.js in development mode (watch for changes)
- `build` — build for production
- `start` — start the production server
- `lint` — run ESLint on all project files

**Run development server:**

```bash
npm run dev
# Server runs at http://localhost:3000
```

**Build and run production:**

```bash
npm run build
npm start
```

**Check code quality:**

```bash
npm run lint
```


## Authentication

The `useAuth` hook in `hooks/useAuth.js` encapsulates authentication state and provides helper functions:

- Check if user is authenticated
- Get current user info (role, name, etc.)
- Handle login/logout flows
- Manage auth tokens from the Django backend

**Supported Auth Methods:**
- JWT tokens (stored in localStorage or cookies)
- Session-based cookies
- Role-based access control (RBAC) for Admin, Examiner, Student

Customize the `useAuth` hook to match your backend authentication implementation.

## PWA (Progressive Web App)

`next-pwa` is installed and configured to enable PWA capabilities. This allows the app to work offline and be installed on devices.

**Features:**
- Offline-first experience with service worker caching
- Installable as a native-like app on mobile and desktop
- Web manifest at `public/manifest.json`

**Configuration:** See `next.config.mjs` for PWA settings (cache strategies, offline pages, etc.)

**Manifest:** Update `public/manifest.json` if you change app name, icons, theme colors, or other metadata.

## Styling

Tailwind CSS powers all styling in this project. Configuration and customization is handled in `tailwind.config.js`.

**Key Points:**
- Utility-first CSS approach: compose styles using predefined utility classes
- Responsive design built-in: use `sm:`, `md:`, `lg:` breakpoint prefixes
- CSS is processed by PostCSS (configured in `postcss.config.mjs`)

**Global Styles:** See `app/globals.css` for base styles, custom fonts, and CSS variables.

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** and test thoroughly
4. **Run lint** to ensure code quality: `npm run lint`
5. **Commit** with clear messages: `git commit -m "Add: feature description"`
6. **Push** to your fork and **create a Pull Request**

**Guidelines:**
- Keep PRs focused and small
- Add/update tests if applicable
- Update documentation (this README) if adding new features
- Follow the existing code style and naming conventions
- Run linting before submitting: `npm run lint`

**Adding New Pages or Components:**
- New pages go in the `app/` folder following App Router conventions
- New UI components go in `components/ui/` (or `components/` for app-level components)
- Always update this README with new routes or major features

## Troubleshooting

### Styles not loading
- Ensure Tailwind CSS is properly configured in `tailwind.config.js`
- Verify that `globals.css` is imported in `app/layout.js`
- Clear the `.next` build directory: `rm -rf .next && npm run dev`

### API calls failing
- Check that `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`
- Verify the Django backend is running and accessible
- Check browser console and network tab for CORS or other errors
- Ensure auth tokens are being sent with requests (check `lib/api.js` interceptors)

### Build or deployment issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check that all required environment variables are set
- Verify Node.js version is 18+: `node --version`

### PWA not working
- Check that service worker is being generated in `.next/public`
- Open DevTools → Application tab to inspect service worker registration
- Clear browser cache and hard refresh (Ctrl+Shift+R)

## License & Contact

This project does not include a LICENSE file yet. Add one if you plan to open-source (MIT, Apache 2.0, etc.).

**Questions or Issues?**
- Open a GitHub issue for bug reports and feature requests
- Contact the maintainers for general questions
- Check existing issues and discussions before creating new ones

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
