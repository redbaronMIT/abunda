# Abunda — Project Planning Conversation Log

**Date:** 2026-02-17
**Context:** Started from the `takeoutncode` project, planning a new project called Abunda.

---

## Starting Point

**User:** Reminded me where we left off on the takeoutncode project.

**Claude:** Reviewed the git history:

- **Branch:** `feat/retro-terminal-ui` (clean working tree)
- Recent commits:
  1. `48bb954` — Apply Prettier formatting and add commit guidelines
  2. `1dceccd` — Add Prettier formatting to pre-commit hook
  3. `7225743` — Redesign UI with retro CRT terminal aesthetic
  4. `4ebdf57` — Add translation app with dev tooling
- The project is a vanilla JS translation app using MyMemory API, with a retro CRT terminal aesthetic, Prettier, ESLint, and Husky pre-commit hooks set up.

---

## Starting a New Project

**User:** Asked how to start a new project and keep some of the useful things from takeoutncode.

**Claude:** Identified reusable pieces:

- `package.json` — Vite, ESLint, Prettier, Husky scripts
- `.eslintrc.*` / `eslint.config.js` — lint rules
- `.prettierrc` — formatting settings
- `.husky/` — pre-commit hook setup
- `CLAUDE.md` — adapted for the new project

Suggested approaches:

1. Create a fresh repo, copy config files, run `npm install`
2. Make a lightweight template directory
3. Start fresh with `npm create vite@latest`, then copy configs

---

## Defining Abunda

**User:** The new project is called "abunda" — a financial budgeting and planning tool with game-like interaction features. New to programming, needs help defining requirements and application flow.

**Claude:** Asked clarifying questions about features, game elements, data storage, and tech stack.

**User:** Clarified:

- Focus on interacting with the interface in a game-like way
- Figure out "gamification" aspects later
- Visual/animated interactions (drag-and-drop, animated progress bars, satisfying transitions)
- Narrative aspects (financial journey has a story, UI reflects progress)
- Project location: `/Users/jw/DEV/code/abunda`
- Tech stack: help me decide

**Claude:** Recommended vanilla JS + Vite + CSS:

- Already familiar from the translation app
- Forces learning fundamentals that transfer to any framework
- CSS animations are powerful enough for the visual/animated feel
- Can migrate to a framework later if needed

---

## Architecture Exploration — Treehouse Village (Rejected)

**Claude** initially proposed a **treehouse village** narrative:

- Each savings goal = a treehouse being built
- Budget health = forest weather
- Trees grow as finances improve

**User:** Rejected the treehouse concept. Preferred a **beach/ocean theme**.

---

## Architecture — Beach/Ocean Theme (Accepted)

**User:** Described the vision:

> The app shall be beach/ocean themed. Abundance is modeled by walking along the shore and there are so many shells and "sand dollars" to pick up! Key "rooms" of the application/game: a room with baskets where you can "sort your shells" into baskets (representing budgeting), a room that is the cockpit of a fishing boat with dials and switches and gauges to see how your accounts and money is doing (representing awareness), and another room to be determined that allows for planning.

**Claude** interpreted the rooms:

### The Shore (Home/Landing)

- Animated beach scene — waves, sand, scattered shells
- Quick financial snapshot (income this month, total saved)
- Entry point to the three rooms
- The beach gets more lush with shells as finances improve

### Room 1: The Sorting Room (Budgeting)

- A room with woven baskets on a wooden table/shelf
- Each basket = a budget category (Housing, Food, Transport, etc.)
- Shells represent money to allocate — distribute them into baskets
- Visual feedback: baskets fill up, overflow if over-budget
- Add transactions here (expenses go into category baskets)

### Room 2: The Cockpit (Awareness/Dashboard)

- Fishing boat cockpit with analog instruments
- **Fuel gauge** — savings level (empty to full)
- **Speedometer** — spending rate (how fast burning through budget)
- **Compass** — on track this month? (needle points to "on course" or "off course")
- **Toggle switches** — flip between accounts or time periods
- **Depth gauge** — debt level (if applicable)
- All dials/gauges are CSS-drawn and animated

### Room 3: TBD (Planning)

- To be designed later
- Possible concepts: captain's quarters with maps, lighthouse with telescope, navigation chart table
- Will handle savings goals, future planning, projections

**Navigation:** Simple bottom nav bar for now. Future upgrade: animated "walking" between rooms.

---

## Tech Stack & Tooling

Carried over from takeoutncode (minus tailwindcss):

- **Vite 6.x** — dev server, build
- **ESLint 9.x** (flat config) — eqeqeq error, curly error, no-console off, no-unused-vars warn, no-undef error
- **Prettier** — single quotes, 2-space indent, semicolons, trailing commas es5, 100 char width
- **Husky** — pre-commit runs `npm run format` then `npm run lint`
- **PostCSS + Autoprefixer**

---

## File Structure

```
/Users/jw/DEV/code/abunda/
├── index.html
├── style.css
├── css/
│   ├── animations.css
│   ├── components.css
│   ├── shore.css
│   ├── sorting-room.css
│   ├── cockpit.css
│   └── views.css
├── js/
│   ├── main.js             (~80 lines)
│   ├── state.js            (~200 lines)
│   ├── views.js            (~70 lines)
│   ├── shore.js            (~150 lines)
│   ├── sorting-room.js     (~250 lines)
│   ├── cockpit.js          (~200 lines)
│   ├── onboarding.js       (~150 lines)
│   └── utils.js            (~80 lines)
├── public/
│   └── favicon.svg
├── .husky/
│   └── pre-commit
├── package.json
├── vite.config.js
├── eslint.config.js
├── postcss.config.js
├── .prettierrc
├── .gitignore
└── CLAUDE.md
```

---

## Data Model

localStorage key: `abunda-data`

```js
{
  version: 1,
  onboardingComplete: false,
  createdAt: '2026-02-17T00:00:00Z',

  budget: {
    monthlyIncome: 4000,
    monthlyBudget: 3200,
    categories: [
      { id: 'cat_1', name: 'Housing', color: '#60a5fa', icon: 'shell', budgetAmount: 1200 },
      { id: 'cat_2', name: 'Food', color: '#4ade80', icon: 'starfish', budgetAmount: 500 },
      { id: 'cat_3', name: 'Transport', color: '#facc15', icon: 'seahorse', budgetAmount: 200 },
      { id: 'cat_4', name: 'Fun', color: '#c084fc', icon: 'coral', budgetAmount: 150 },
      { id: 'cat_5', name: 'Other', color: '#94a3b8', icon: 'pebble', budgetAmount: 300 },
    ],
  },

  transactions: [
    {
      id: 'txn_abc123',
      type: 'expense',
      amount: 45.50,
      categoryId: 'cat_2',
      note: 'Groceries',
      date: '2026-02-15',
      createdAt: '2026-02-15T14:30:00Z',
    },
  ],

  goals: [],
}
```

---

## Onboarding (first-time only)

3 steps with animated transitions:

1. **Welcome** — "Welcome to Abunda" with animated waves washing shells onto shore
2. **Set budget** — Monthly income + spending budget inputs
3. **Name your baskets** — Confirm or customize 5 default budget categories

---

## Key Interactions

- **Shore:** Animated beach with waves, shells bobbing. Shell density reflects financial health.
- **Sorting Room:** Baskets fill as expenses are added. Shell drop animation on transaction entry. Overflow visual when over-budget.
- **Cockpit:** CSS-drawn analog gauges with smooth needle transitions. Toggle switches flip between views. Status LEDs for categories.
- **Micro-interactions:** Button press bounce, view fade/slide transitions, shimmer on progress elements.

---

## Implementation Phases

1. **Project setup & app shell** — tooling, HTML skeleton, view switching
2. **State management & onboarding** — data layer, first-time setup wizard
3. **The Shore** — animated beach home view
4. **The Sorting Room** — budget tracking with basket metaphor
5. **The Cockpit** — financial dashboard with analog instruments
6. **Polish & settings**

---

## Project Setup Completed

- Created directory at `/Users/jw/DEV/code/abunda`
- Initialized git repo
- Created `.gitignore` and `CLAUDE.md`
- Pushed to GitHub: https://github.com/redbaronMIT/abunda
- Initial commit: `a5b59a2`
