# User Directory Desk

A responsive React + TypeScript CRUD application for managing users, built
against the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) API.

## Features

- **Fetch** — loads users from JSONPlaceholder and displays name, email,
  phone, profession, and city in a searchable list.
- **Create** — a form POSTs a new user to the API and adds it to the list.
- **Update** — each user has an Edit view, pre-filled with their data, that
  PUTs changes to the API.
- **Delete** — each user has a Delete action that sends a DELETE request,
  with a confirmation dialog before it runs.
- **Routing** — React Router drives a list view, a detail view per user,
  and create/edit form views.
- **Light & dark mode** — a toggle in the top bar switches themes instantly;
  the choice is remembered (`localStorage`) and otherwise defaults to the
  visitor's OS preference, with no flash of the wrong theme on load.
- **Data persistence** — JSONPlaceholder is a mock API: it accepts writes
  but never actually saves them, so a real refetch would always return the
  same fixed 10 users. To make CRUD feel real across reloads, this app
  keeps a small local diff in `localStorage` on top of the API response:
  users you create, edits you make to existing users, and users you
  delete all survive a page refresh.
- **Loading & error states** — skeleton placeholders while fetching, and a
  retry option if the request fails.
- **Responsive, accessible UI** — built with semantic HTML, visible focus
  states, and a layout that adapts from mobile to desktop.

## Tech stack

React 19 · TypeScript · Vite · React Router · plain CSS (no UI framework)

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Build for production

```bash
npm run build   # type-checks, then builds to dist/
npm run preview # serve the production build locally to sanity-check it
```

## Deploying

This is a client-side-routed single-page app, so the host needs to serve
`index.html` for every path (otherwise refreshing on `/users/3` 404s).
That's already configured here:

- **Vercel** — `vercel.json` rewrites every path to `index.html`. Import
  the repo at [vercel.com/new](https://vercel.com/new) and deploy with the
  defaults (Vite is auto-detected).
- **Netlify** — `netlify.toml` (and `public/_redirects` as a fallback) does
  the same. Import the repo at
  [app.netlify.com/start](https://app.netlify.com/start), or drag the
  built `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

## Project structure

```
src/
  api/          JSONPlaceholder fetch wrappers (GET/POST/PUT/DELETE)
  components/   Reusable pieces: user list, form, confirm dialog, skeleton
  context/      ThemeProvider (light/dark) and UserProvider (CRUD + cache)
  pages/        Route-level views: home, detail, create/edit, 404
  types/        Shared TypeScript types
  utils/        localStorage persistence helpers, pointer-glow effect
```

## Notes on the simulated API

JSONPlaceholder's `POST`/`PUT`/`DELETE` endpoints validate and echo back a
response but don't persist anything server-side — every `GET /users`
still returns the same 10 seed users. The app still sends every request
(so the network tab shows real CRUD calls), but treats the local cache as
the source of truth for what the user actually sees.
