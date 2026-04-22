# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Camper** is a Korean-language camping reservation manager and packing checklist SPA. It is pure vanilla JavaScript with zero dependencies, no build step, and no package manager. Open `index.html` directly in a browser to run it.

## Running the App

There is no build or install step. Serve the three files (`index.html`, `app.js`, `style.css`) from any static file server or open `index.html` directly in a browser.

```bash
# Quick local server options
python3 -m http.server 8080
# or
npx serve .
```

There are no tests, no linter, and no CI configuration in this project.

## Architecture

All application logic lives in `app.js`. State is held in two module-level variables and persisted to `localStorage`:

| Variable | localStorage key | Shape |
|---|---|---|
| `reservation` | `campReservation` | `{ campground, checkIn, checkOut }` or `null` |
| `checklist` | `campChecklist` | `Array<{ id: number, text: string, completed: boolean }>` |

`currentFilter` (`'all'` / `'pending'` / `'completed'`) is transient and never persisted.

### Update pattern

Every checklist mutation follows the same pattern:
1. Mutate the `checklist` array in memory.
2. Call `saveAndRender()`, which writes to `localStorage` and re-renders the list and progress bar.

Reservation saves are handled inline in the save button listener (writes to `localStorage`, then calls `renderReservation()`).

### DOM visibility

Elements are shown/hidden by toggling the `.hidden` CSS class. The reservation card and its edit form swap visibility this way. There is no routing — the whole app is a single view.

### Event handling mix

Static elements (buttons, tabs, inputs) use `addEventListener` wired up in `setupEventListeners()` on `DOMContentLoaded`. Dynamically generated checklist items use inline `onclick` attributes that call global functions (`toggleItem(id)`, `deleteItem(id)`).

### Item IDs

New checklist items use `Date.now()` as their `id`, so IDs are timestamps (numbers), not sequential integers.

## Key Files

- `index.html` — HTML skeleton; all IDs referenced in `app.js` are defined here.
- `app.js` — All logic: state, rendering, event wiring, localStorage I/O.
- `style.css` — Glassmorphism design; mobile-first, max-width 600 px; animations use `@keyframes fadeIn` and `slideIn`.

## Language

All user-facing strings are in Korean and are hardcoded in `app.js` and `index.html`. Keep new strings in Korean to match the existing UI.
