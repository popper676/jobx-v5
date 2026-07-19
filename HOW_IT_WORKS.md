# How JobX Works (Under the Hood)

This document explains the technical architecture, data flow, and core mechanisms of the JobX application.

## 1. High-Level Architecture
JobX is a **Single Page Application (SPA)** built with:
*   **React 18** for building the user interface.
*   **Vite** as the fast build tool and development server.
*   **TypeScript** for static type checking and better developer experience.
*   **React Router v6** for client-side routing (navigating without page reloads).
*   **Tailwind CSS** for styling.

Currently, JobX is a **frontend-only application**. It does not have a real backend server (like Node.js or Python) or a real database (like PostgreSQL or MongoDB). Instead, it **simulates a backend** entirely in the browser.

---

## 2. Data Storage & "Backend" Simulation

Since there is no real database, JobX uses the browser's **Local Storage** to save data.

### The Database Layer (`src/services/db.ts`)
This file acts as the mock database. It reads and writes stringified JSON objects to the browser's `localStorage`.
*   When the app first loads, it checks if there is data in localStorage.
*   If empty, it seeds the database using the mock data from `src/data.ts` (e.g., `MOCK_JOBS`, `MOCK_USERS`).
*   This ensures that when you refresh the page or close the browser, your data (like saved jobs, applications, or profile edits) is not lost.

### The Service Layer (`src/services/*.ts`)
These files simulate API calls to a server. For example:
*   `authService.ts`: Handles login/signup by checking credentials against the data in `db.ts`.
*   `jobService.ts`: Handles fetching jobs, saving jobs, and applying for jobs.
When a component needs data, it doesn't talk to `db.ts` directly; it calls a function from the Service Layer.

---

## 3. Global State Management (`src/store/StoreProvider.tsx`)

JobX uses React's **Context API** (`createContext`, `useContext`, `useReducer`/`useState`) to manage global state. This is the "brain" of the application while it's running.

*   **What it stores:** The currently logged-in user's details, authentication status, saved jobs, applied jobs, theme preference (dark/light), etc.
*   **How it works:**
    1.  The `<StoreProvider>` wraps the entire application in `App.tsx`.
    2.  When a user logs in, the `StoreProvider` updates its internal state to reflect the active user.
    3.  Any component (like `HomeFeed.tsx` or `Profile.tsx`) can access this data instantly by calling the `useStore()` hook.
    4.  If a user clicks "Save Job", the component tells the `StoreProvider` to update the state. The `StoreProvider` updates the UI instantly and also calls the Service Layer to save the change to `localStorage`.

---

## 4. Routing & Protection (`src/App.tsx`)

React Router handles which page to show based on the URL.

*   **Public Routes:** Pages like `/signin` and `/signup`. They are wrapped in a `<PublicRoute>` component. If a user is already logged in, they are automatically redirected to the home page (`/`).
*   **Protected Routes:** Pages like `/dashboard`, `/jobs`, and `/profile`. They are wrapped in a `<ProtectedRoute>` component. If a user is NOT logged in, they are redirected to `/signin`.
*   **Lazy Loading:** Pages are imported using `React.lazy()`. This means the browser only downloads the code for a page when the user actually navigates to it, making the initial app load much faster.

---

## 5. Key Workflows

### Authentication Flow
1. User enters email/password in `SignIn.tsx`.
2. Component calls `authService.login(email, password)`.
3. `authService` checks the mock database (`db.ts`).
4. If successful, it returns user data.
5. Component calls `store.login(userData)`.
6. `StoreProvider` updates the global state to `isAuthenticated: true` and sets the `user` object.
7. `<ProtectedRoute>` sees the user is authenticated and allows access to the main app.

### Applying for a Job Flow
1. User clicks "Apply" on a job in `Jobs.tsx`.
2. Component calls `store.applyToJob(jobId)`.
3. `StoreProvider` adds the job to the user's `appliedJobs` array in the global state (updating the UI immediately to show "Applied").
4. `StoreProvider` simultaneously calls `jobService.applyJob(jobId)` to save this change permanently in `localStorage`.

### Dark Mode Toggle
1. User clicks the theme toggle button.
2. The `theme` state in `StoreProvider` switches between 'light' and 'dark'.
3. This adds or removes the `dark` class on the root `<html>` element of the document.
4. Tailwind CSS reads the `.dark` class and applies the dark mode styling overrides defined in `index.css`.

---

## Summary
JobX is a cleverly designed frontend prototype. It feels like a full-stack application because it uses `localStorage` and a structured Service Layer to mimic a real database and API. This architecture makes it very easy to plug in a real backend (like Node.js/Express + PostgreSQL or Supabase/Firebase) later on, simply by swapping out the contents of the `src/services/` files with real HTTP requests (using `fetch` or `axios`).
