# Abunda — Display & Visualization Requirements

**Date:** 2026-02-17
**Status:** Draft v1

---

## Overview

"Under the Sea" is the fourth room — a user-composable data exploration space themed as the ocean depths. Where the Shore gives a glance, the Sorting Room gives control, and the Cockpit gives awareness, Under the Sea gives **insight**: patterns, trends, and comparisons that help users understand their financial behavior over time.

The ocean metaphor: diving deeper = exploring further back in time or further into the data. Each visualization is a creature or feature of the reef — the user assembles their own ecosystem of insight.

---

## Design Philosophy

Guiding principles (Tufte + Few):

- **Show comparisons, not just numbers.** A number without context is noise. Every display should make a comparison obvious — vs. last month, vs. budget, vs. a trend line.
- **Maximize information density.** Eliminate decorative elements that don't carry data. Ocean aesthetic comes from layout, color, and motion — not chart chrome.
- **Make the insight visible without effort.** A user should be able to glance at a panel and know what it's telling them. If they have to calculate in their head, the chart has failed.
- **Default to smart, let users refine.** Each visualization knows what data it needs and fetches it automatically. Filters are optional and additive.

---

## The Under the Sea Room

### Layout

- A scrollable, grid-based canvas (CSS Grid)
- Panels can be resized and reordered (drag-to-rearrange, v2)
- A persistent "+ Add Panel" button opens the visualization picker
- Each panel has: title (editable), the visualization, and a filter/settings drawer

### Panel anatomy

```
┌─────────────────────────────────────┐
│ Panel Title              [⚙ filters]│
│                                     │
│         [visualization]             │
│                                     │
│  [insight callout — key takeaway]   │
└─────────────────────────────────────┘
```

The **insight callout** is a one-line plain-English summary auto-generated from the data.
Example: _"Food spending has increased 3 months in a row."_
Example: _"You're 12% ahead of spending pace for this month."_

---

## Visualization Types

### 1. Cash Flow Waterfall

**What it shows:** Where your money goes — income as the starting bar, each spending category as a step down, savings as what remains.
**Why it's insightful:** Makes proportions and sequencing obvious. You see immediately which category consumes the most and what's left over.
**Default data:** Current month, all categories, income vs. expense.
**Supported filters:** Date range, category inclusion/exclusion.
**Ocean theme:** Water cascading down over a reef ledge.

---

### 2. Spending Velocity

**What it shows:** Cumulative spending over the month (actual line) vs. a "par line" (what even daily spending would look like).
**Why it's insightful:** One glance shows if you're ahead or behind pace. A steep early curve = front-loaded spending. Flat middle + steep end = big purchases coming.
**Default data:** Current month, all expense transactions.
**Supported filters:** Date range, categories.
**Ocean theme:** A depth gauge descending through the month.

---

### 3. Category Sparklines (Small Multiples)

**What it shows:** A grid where every category gets its own mini trend line — last N months of spending.
**Why it's insightful:** You scan the whole grid in seconds and spot the category that's been quietly creeping upward. Individual charts would take minutes.
**Default data:** Last 6 months, all categories.
**Supported filters:** Date range (3, 6, 12 months), category selection.
**Ocean theme:** A reef wall — each creature is a category, its shape reflects its trend.

---

### 4. Month-over-Month Delta

**What it shows:** Bar chart of spending per category this month vs. last month (or vs. N-month average). Bars are colored by direction (over/under).
**Why it's insightful:** Context transforms numbers into signals. "$320 on food" is meaningless. "$47 more than last month" is actionable.
**Default data:** Current month vs. prior month, all categories.
**Supported filters:** Comparison period (last month, 3-month avg, 6-month avg), categories.
**Ocean theme:** Tide comparison — high tide vs. low tide markers per category.

---

### 5. Savings Rate Trend

**What it shows:** A single line chart of savings rate (%) month by month.
**Why it's insightful:** The most important single financial health metric. Trends matter more than any individual month.
**Default data:** Last 12 months.
**Supported filters:** Date range.
**Ocean theme:** The horizon line between surface and depth — rising means you're surfacing.

---

### 6. Budget Variance

**What it shows:** Actual vs. budgeted per category, sorted by largest variance (over or under). A bullet chart or horizontal bar.
**Why it's insightful:** Shows you exactly where your plan broke down and by how much. Sorted by variance = most important problems first.
**Default data:** Current month, all categories.
**Supported filters:** Date range, categories, show only over-budget / under-budget.
**Ocean theme:** Sonar readings — distance from target shown as echo depth.

---

### 7. Income vs. Spending Over Time

**What it shows:** Grouped or stacked area chart — income bars and spending bars side by side per month.
**Why it's insightful:** Reveals structural surplus or deficit patterns. Are you consistently spending less than you earn, or are some months underwater?
**Default data:** Last 6 months.
**Supported filters:** Date range.
**Ocean theme:** Surface vs. underwater — income is above the waterline, spending is below.

---

### 8. Spending Breakdown (Pie / Treemap)

**What it shows:** Proportional breakdown of spending by category. User can pick pie chart (familiar) or treemap (more accurate for comparison).
**Why it's insightful:** Simple but useful as a sanity check on category proportions.
**Default data:** Current month, expense transactions only.
**Supported filters:** Date range, categories, chart type (pie or treemap).
**Ocean theme:** A cross-section of the ocean floor — each zone is a category.

---

### 9. Transaction Heatmap

**What it shows:** A calendar heatmap — each day colored by spend intensity. Like GitHub's contribution graph.
**Why it's insightful:** Reveals behavioral patterns — weekend splurges, end-of-month spending, payday reactions.
**Default data:** Current month. Can expand to 3 months.
**Supported filters:** Date range, categories (filter to one category to see its pattern).
**Ocean theme:** Bioluminescence — bright spots are high-activity days.

---

### 10. Net Flow Summary (Scorecard)

**What it shows:** A compact set of key metrics: effective income, total spent, total saved, remaining, savings rate, on-track status.
**Why it's insightful:** A dense single-panel summary — for users who just want the numbers.
**Default data:** Current month.
**Supported filters:** Date range.
**Ocean theme:** The captain's log — a clean numerical readout.

---

## Standard Chart Types (User Option)

Users can also create panels using generic chart builders:

| Type       | Use case                                           |
| ---------- | -------------------------------------------------- |
| Bar chart  | Comparing values across categories or time periods |
| Line chart | Trends over time for one or more series            |
| Pie chart  | Proportional breakdown (simple, familiar)          |

For each generic chart, the user:

1. Picks a data series (e.g. "Food spending by month", "Income vs. expenses")
2. Picks a chart type
3. Optionally applies filters

---

## Filter System

Filters are optional and additive. Each panel starts with its smart defaults and the user can layer on refinements.

### Available filters

| Filter            | Type         | Options                                                                   |
| ----------------- | ------------ | ------------------------------------------------------------------------- |
| Date range        | Select       | Current month, Last 3 months, Last 6 months, Last 12 months, Custom range |
| Categories        | Multi-select | Any combination of user's categories                                      |
| Transaction type  | Select       | Expenses only, Income only, Both                                          |
| Comparison period | Select       | Prior month, 3-month average, 6-month average (where applicable)          |
| Chart type        | Select       | Pie or Treemap (Breakdown panel only)                                     |

### Filter UX

- Filters live in a collapsible drawer on each panel (the ⚙ icon)
- Active filters are shown as small chips below the panel title
- Resetting returns to smart defaults
- Filters are saved per panel as part of the dashboard state

---

## Data Model Additions

The Under the Sea dashboard state is stored under `dashboard` in `abunda-data`.

```js
dashboard: {
  panels: [
    {
      id: 'panel_abc123',
      type: 'spending-velocity',      // visualization type key
      title: 'Spending This Month',   // user-editable
      position: 0,                    // order in the grid
      size: 'medium',                 // 'small' | 'medium' | 'large'
      filters: {
        dateRange: 'current-month',
        categories: 'all',            // 'all' or string[] of category IDs
        transactionType: 'expense',
        comparisonPeriod: null,
      },
    },
  ],
},
```

### Visualization type registry (in code, not stored data)

Each visualization type is defined as a registry entry:

```js
{
  key: 'spending-velocity',
  label: 'Spending Velocity',
  description: 'Cumulative spending vs. expected pace for the month.',
  defaultFilters: {
    dateRange: 'current-month',
    categories: 'all',
    transactionType: 'expense',
  },
  supportedFilters: ['dateRange', 'categories'],
  defaultSize: 'medium',
  insightGenerator: (data) => string,   // returns plain-English callout
}
```

New visualization types can be added to the registry without changing the data model or dashboard schema.

---

## Ocean Theme — Visual Language

| Depth zone                | Represents                       | Visual style                          |
| ------------------------- | -------------------------------- | ------------------------------------- |
| Sunlight zone (0–200m)    | Current month data               | Bright, high contrast, warm tones     |
| Twilight zone (200–1000m) | Recent history (last 3–6 months) | Cooler blues, softer contrast         |
| Midnight zone (1000m+)    | Long-term history (6–12+ months) | Deep blues, bioluminescent highlights |

- Scrolling down the canvas = diving deeper (older data)
- Panel backgrounds shift in color as the user scrolls
- Data points can have a subtle bioluminescent glow on hover
- Gridlines styled as light rays filtering through water

---

## Extensibility

New visualization types are added by:

1. Writing the chart component (JS + CSS)
2. Adding an entry to the visualization registry
3. No changes to the data model or filter system required

The registry-based design means the "add panel" picker automatically includes new types without any UI changes.

---

## Out of Scope (v1)

- Drag-to-resize panels (v2)
- Sharing or exporting charts
- Annotations or notes on charts
- Predictive / ML-based insights
- Benchmarking against other users
- Custom calculated metrics (user-defined formulas)
