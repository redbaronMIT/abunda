# CLAUDE.md

## Project Overview

Abunda is a financial budgeting and planning tool with a beach/ocean theme. Abundance is modeled as walking along the shore collecting shells and sand dollars. Built with vanilla JS (ES modules), Vite, and custom CSS. Data stored in localStorage.

## Narrative Concept

Your finances are a walk along the shore. Money coming in = shells and sand dollars washing up. The app is organized into "rooms", each a distinct interactive experience:

- **The Shore (Home)** — Animated beach scene with waves and scattered shells. Quick financial snapshot. Shell density reflects financial health.
- **The Sorting Room (Budgeting)** — Woven baskets on shelves. Each basket = a budget category (including a required Savings basket). Adding expenses drops shells into baskets. Baskets fill up and overflow if over-budget.
- **Captain's Maps (Planning)** — A wooden captain's table with nautical parchment maps spread across it. Each map is a free-form life plan: the user draws a route, places waypoints with financial goals, and a sailing ship marks current progress. Multiple maps coexist on the table. Full undo/redo history per map. New maps are created by clicking a parchment roll in the corner.
- **The Cockpit (Awareness)** — Fishing boat cockpit with CSS-drawn analog instruments: fuel gauge (savings rate), speedometer (spending rate), compass (on-track/off-track), toggle switches (time periods), status LEDs (per category).
- **Under the Sea (Exploration)** — User-composable data exploration space. Ocean depth = data depth. Users build a personal dashboard from a registry of insight-first visualizations (waterfall, sparklines, velocity, variance, etc.) with optional filters. Each panel includes a plain-English insight callout.

Navigation: 5-tab bottom bar. Tab order: Shore | Sorting Room | Captain's Maps (center, ship's wheel) | Cockpit | Under the Sea.

## Financial Model

See `docs/financial-requirements.md` for full detail. Key decisions:

- **Budget period**: Current calendar month (resets on the 1st). No rollover.
- **Income**: Base monthly income (set in onboarding) + optional logged income transactions. Effective income = base + income transactions this month.
- **Savings**: A required budget category ("pay yourself first"). Cannot be deleted. The cockpit fuel gauge reflects savings rate.
- **Recurring**: Stored as `forecasts[]` — never auto-post. Actuals are always manually logged. Forecasts inform the Planning room and Cockpit projections.
- **Future**: Zero-based budgeting mode (all income allocated = $0 remainder) is a planned addition requiring no schema changes.

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
js/captains-maps.js    — Captain's Maps (table, map canvas, path drawing, ship position)
js/cockpit.js          — Cockpit (gauge calculations, dial rendering)
js/under-the-sea.js    — Under the Sea (dashboard composition, panel rendering)
js/viz-registry.js     — Visualization type registry (all chart/viz definitions)
js/onboarding.js       — First-time user setup wizard
js/utils.js            — Formatters, ID generation, helpers
style.css              — Root styles, CSS variables, imports
css/animations.css     — Shared keyframe animations
css/components.css     — Buttons, cards, forms, gauges, progress bars
css/shore.css          — Shore/beach scene CSS illustration
css/sorting-room.css   — Sorting room (baskets, shelves, shells)
css/captains-maps.css  — Captain's Maps (table, parchment maps, ship, path)
css/cockpit.css        — Cockpit instruments (dials, switches, gauges)
css/under-the-sea.css  — Under the Sea (panels, depth zones, bioluminescence)
css/views.css          — View layout, nav bar, onboarding
```

### Key Patterns

- **State**: Single `appState` object in `state.js`, persisted to localStorage under `abunda-data`
- **Views**: Simple show/hide with CSS classes, managed by `views.js`
- **Narrative**: Financial data maps to visual states (shell density, basket fill, gauge positions)
- **Animations**: CSS keyframes + transitions; JS only toggles classes
- **Instruments**: All cockpit gauges/dials drawn with CSS (circles, gradients, transforms for needles)
- **Viz registry**: Each visualization type is a self-contained registry entry with default filters, supported filters, and an insight generator function. New types can be added without schema changes.

## Data Model

localStorage key: `abunda-data`. Full schema:

```js
{
  version: 1,
  onboardingComplete: false,
  createdAt: 'ISO8601',

  budget: {
    monthlyIncome: 4000,
    categories: [
      { id, name, color, icon, budgetAmount, isSavings }
      // isSavings: true only on the required Savings category
    ],
  },

  transactions: [
    { id, type, amount, categoryId, note, date, createdAt }
    // type: 'expense' | 'income'
    // categoryId: null for income transactions
  ],

  forecasts: [
    { id, name, amount, categoryId, frequency, nextDueDate, active }
    // frequency: 'monthly' | 'weekly' | 'biweekly' | 'yearly'
    // forecasts are never auto-posted; actuals are always manually logged
  ],

  dashboard: {
    panels: [
      { id, type, title, position, size, filters }
      // type matches a key in the viz registry
      // size: 'small' | 'medium' | 'large'
    ],
  },

  captainsMaps: [
    {
      id, title,
      tablePosition: { x, y },    // position on the table
      tableSize: { width, height },
      zIndex,
      path: [{ x, y }, ...],      // user-drawn route points
      objects: [
        {
          id, type,               // 'waypoint' | 'custom'
          position: { x, y },
          label,
          // waypoint fields:
          goalType,               // 'savings' | 'debt' | 'custom' | null
          targetValue,            // null = not data-connected
          targetDate,             // null = not time-based
          dataLink,               // future: category ID
          // custom fields:
          icon, note, userDefinedMeaning,
        },
      ],
      history: [],                // state snapshots for undo, max 100
      createdAt, updatedAt,
    },
  ],
}
```

See `docs/financial-requirements.md` for calculation definitions (effectiveIncome, savingsRate, onTrack, etc.).
See `docs/display-requirements.md` for all visualization types, filter options, and Under the Sea design.

## Code Style

ESLint: eqeqeq error, curly error, no-console off, no-unused-vars warn, no-undef error
Prettier: single quotes, 2-space indent, semicolons, trailing commas es5, 100 char width

## Pre-commit Hook

Husky runs `npm run format` then `npm run lint` before commits.

## File Length Guidelines

Keep JS files under 300 lines. Split only when there is clear separation of concerns.

## Implementation Phases

1. Project setup & app shell (tooling, HTML skeleton, view switching) ✅
2. State management & onboarding (data layer, first-time setup wizard) ✅
3. The Shore — animated beach home view
4. The Sorting Room — budget tracking with basket metaphor
5. Captain's Maps — life planning with nautical maps, waypoints, ship progress
6. The Cockpit — financial awareness with analog instruments
7. Under the Sea — composable insight dashboard
8. Polish & settings

See `docs/captains-maps.md` for full Captain's Maps design spec.
