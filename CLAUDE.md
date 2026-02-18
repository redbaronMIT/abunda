# CLAUDE.md

## Project Overview

Abunda is a financial budgeting and planning tool with a beach/ocean theme. Abundance is modeled as walking along the shore collecting shells and sand dollars. Built with vanilla JS (ES modules), Vite, and custom CSS. Data stored in localStorage.

## Narrative Concept

Your finances are a walk along the shore. Money coming in = shells and sand dollars washing up. The app is organized into "rooms", each a distinct interactive experience:

- **The Shore (Home)** — Animated beach scene with waves and scattered shells. Quick financial snapshot. Shell density reflects financial health.
- **The Sorting Room (Budgeting)** — Woven baskets on shelves. Each basket = a budget category. Adding expenses drops shells into baskets. Baskets fill up and overflow if over-budget.
- **The Cockpit (Awareness)** — Fishing boat cockpit with CSS-drawn analog instruments: fuel gauge (savings), speedometer (spending rate), compass (on-track/off-track), toggle switches (time periods), status LEDs (per category).
- **Room 3 (Planning)** — TBD. Will handle savings goals, future planning, projections.

Navigation: bottom tab bar (future upgrade: animated "walking" between rooms).

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Format code with Prettier
npm run format:check # Check formatting
```

## Architecture

```
js/main.js             — App entry point, boot sequence
js/state.js            — Data layer (localStorage CRUD, state management)
js/views.js            — View manager (show/hide views, tab navigation)
js/shore.js            — Shore view (beach scene, financial snapshot)
js/sorting-room.js     — Sorting room (transaction form, baskets, history)
js/cockpit.js          — Cockpit (gauge calculations, dial rendering)
js/onboarding.js       — First-time user setup wizard
js/utils.js            — Formatters, ID generation, helpers
style.css              — Root styles, CSS variables, imports
css/animations.css     — Shared keyframe animations
css/components.css     — Buttons, cards, forms, gauges, progress bars
css/shore.css          — Shore/beach scene CSS illustration
css/sorting-room.css   — Sorting room (baskets, shelves, shells)
css/cockpit.css        — Cockpit instruments (dials, switches, gauges)
css/views.css          — View layout, nav bar, onboarding
```

### Key Patterns

- **State**: Single `appState` object in `state.js`, persisted to localStorage under `abunda-data`
- **Views**: Simple show/hide with CSS classes, managed by `views.js`
- **Narrative**: Financial data maps to visual states (shell density, basket fill, gauge positions)
- **Animations**: CSS keyframes + transitions; JS only toggles classes
- **Instruments**: All cockpit gauges/dials drawn with CSS (circles, gradients, transforms for needles)

## Data Model

localStorage key: `abunda-data`. Schema includes:
- `budget` — monthlyIncome, monthlyBudget, categories (each with id, name, color, icon, budgetAmount)
- `transactions` — array of { id, type, amount, categoryId, note, date }
- `goals` — array (for future Room 3)
- `onboardingComplete` — boolean flag

## Code Style

ESLint: eqeqeq error, curly error, no-console off, no-unused-vars warn, no-undef error
Prettier: single quotes, 2-space indent, semicolons, trailing commas es5, 100 char width

## Pre-commit Hook

Husky runs `npm run format` then `npm run lint` before commits.

## File Length Guidelines

Keep JS files under 300 lines. Split only when there is clear separation of concerns.

## Implementation Phases

1. Project setup & app shell (tooling, HTML skeleton, view switching)
2. State management & onboarding (data layer, first-time setup wizard)
3. The Shore — animated beach home view
4. The Sorting Room — budget tracking with basket metaphor
5. The Cockpit — financial dashboard with analog instruments
6. Polish & settings
