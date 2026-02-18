# Abunda — Financial Requirements

**Date:** 2026-02-17
**Status:** Draft v1

---

## Core Decisions

| Topic                  | Decision                                                   |
| ---------------------- | ---------------------------------------------------------- |
| Income model           | Base monthly income + optional logged income transactions  |
| Budget period          | Current calendar month (resets on the 1st)                 |
| Savings model          | Savings is a budget category ("pay yourself first")        |
| Recurring transactions | Forecasted only — actuals are always manually logged       |
| Future path            | Zero-based budgeting (all income allocated = $0 remainder) |

---

## 1. Budget Period

- The active period is always the **current calendar month** (Jan 1 – Jan 31, etc.)
- All totals (spent, saved, remaining) are **month-to-date**
- Transactions from prior months are kept in history but do not affect current-month calculations
- There is no rollover of unspent budget into the next month (v1)

---

## 2. Income

### 2a. Base Monthly Income

- Set during onboarding and editable in settings
- Represents the user's expected total income for the month
- Used as the denominator for all percentage-based calculations (gauge fill levels, etc.)
- Stored as `budget.monthlyIncome` (number, in dollars)

### 2b. Income Transactions

- Users may log additional income events: freelance pay, side income, gifts, tax refunds, etc.
- Stored in `transactions[]` with `type: 'income'`
- **Effective monthly income** = `budget.monthlyIncome` + sum of income transactions this month
- The Shore and Cockpit use **effective monthly income** for all calculations

### Income transaction fields

```
id          — unique ID (e.g. 'txn_abc123')
type        — 'income'
amount      — positive number
categoryId  — null (income is not categorized in v1)
note        — optional description (e.g. 'Freelance project')
date        — 'YYYY-MM-DD' (user-selected date within current month)
createdAt   — ISO 8601 timestamp
```

---

## 3. Budget Categories

- Users define named categories during onboarding (default set provided)
- Each category has a `budgetAmount` — the monthly spending limit for that category
- **Savings is a required special category** — created automatically, cannot be deleted
- The sum of all `budgetAmount` values is the user's **total monthly budget**
- Total monthly budget does not need to equal monthly income in v1
  - (Future: zero-based mode enforces `sum(categories) == monthlyIncome`)

### Category fields

```
id            — unique ID (e.g. 'cat_savings')
name          — display name (e.g. 'Savings', 'Housing')
color         — CSS color string
icon          — icon key (maps to a CSS-drawn beach icon)
budgetAmount  — monthly allocation in dollars
isSavings     — boolean, true only for the savings category
```

### Default categories (onboarding)

| Name      | Icon        | Default Amount |
| --------- | ----------- | -------------- |
| Savings   | sand-dollar | $400           |
| Housing   | shell       | $1,200         |
| Food      | starfish    | $500           |
| Transport | seahorse    | $200           |
| Fun       | coral       | $150           |
| Other     | pebble      | $300           |

---

## 4. Transactions (Expenses)

- Users log individual expense transactions in the Sorting Room
- Each transaction is assigned to one category (including Savings)
- Logging an expense to Savings means that money has been intentionally set aside

### Expense transaction fields

```
id          — unique ID
type        — 'expense'
amount      — positive number
categoryId  — required, must match a valid category ID
note        — optional description
date        — 'YYYY-MM-DD'
createdAt   — ISO 8601 timestamp
```

### Business rules

- Amount must be > 0
- Category must exist at time of logging
- Date must be within the current calendar month (v1 — no backdating to prior months)
- There is no maximum amount (baskets can overflow)

---

## 5. Recurring Forecasts

Recurring forecasts represent expected future expenses (rent, subscriptions, etc.).
They are **not transactions** — they live in a separate `forecasts[]` array.

### How forecasts work

- User defines a recurring item: name, amount, category, frequency, next due date
- The Planning Room (Room 3) displays upcoming forecasts on a timeline
- The Cockpit can show forecast-adjusted projections (e.g. "projected remaining after bills")
- A forecast **does not auto-post** as a transaction
- When the actual expense occurs, the user logs it manually as a normal transaction
- (Future: the app may prompt "Your rent forecast is due — log it now?")

### Forecast fields

```
id            — unique ID
name          — label (e.g. 'Rent', 'Netflix')
amount        — expected amount
categoryId    — category it belongs to
frequency     — 'monthly' | 'weekly' | 'biweekly' | 'yearly'
nextDueDate   — 'YYYY-MM-DD'
active        — boolean
```

### Forecast-derived calculations

- **Forecasted spending this month** = sum of forecast amounts due in current month
- **Unforecasted spending** = actual spending − forecasted spending (what wasn't planned)
- **Projected end-of-month balance** = effective income − actual spending so far − remaining forecasts due

---

## 6. Key Calculations

These power the visual states across all three rooms.

### Month-to-date values

```
effectiveIncome       = monthlyIncome + sum(income transactions this month)
totalSpent            = sum(expense transactions this month, excluding savings category)
totalSaved            = sum(expense transactions this month, savings category only)
totalAllocated        = totalSpent + totalSaved
remainingBudget       = effectiveIncome − totalAllocated
```

### Per-category values

```
categorySpent(cat)    = sum(expense transactions this month where categoryId == cat.id)
categoryRemaining(cat)= cat.budgetAmount − categorySpent(cat)   // can be negative (overflow)
categoryFillPct(cat)  = categorySpent(cat) / cat.budgetAmount   // can exceed 1.0
```

### Health metrics (used by Shore + Cockpit)

```
savingsRate           = totalSaved / effectiveIncome             // 0.0–1.0+
spendingRate          = totalSpent / effectiveIncome             // 0.0–1.0+
budgetUsedPct         = totalAllocated / effectiveIncome         // 0.0–1.0+
daysElapsedPct        = dayOfMonth / daysInMonth                 // 0.0–1.0
onTrack               = budgetUsedPct <= daysElapsedPct          // boolean
```

### Projected end-of-month

```
projectedSpend        = totalSpent + sum(remaining forecasts due this month)
projectedSavings      = effectiveIncome − projectedSpend − totalSaved
projectedSurplus      = effectiveIncome − projectedSpend − cat_savings.budgetAmount
```

---

## 7. Cockpit Gauge Mappings

| Instrument  | Measures            | Source value              | Range                                  |
| ----------- | ------------------- | ------------------------- | -------------------------------------- |
| Fuel gauge  | Savings level       | `savingsRate`             | 0% (empty) → 25%+ (full)               |
| Speedometer | Spending rate       | `spendingRate`            | 0% (stopped) → 100%+ (redline)         |
| Compass     | On track?           | `onTrack`                 | Points to N (on course) or swings off  |
| Status LEDs | Per-category health | `categoryFillPct` per cat | Green < 75%, Yellow 75–99%, Red ≥ 100% |

---

## 8. Shore Visual Mappings

| Visual                 | Reflects                     | Logic                                                    |
| ---------------------- | ---------------------------- | -------------------------------------------------------- |
| Shell density on beach | Overall financial health     | More shells = higher `remainingBudget / effectiveIncome` |
| Wave energy            | Spending activity this month | More transactions = more active waves                    |
| Sand dollar appearance | Savings milestone            | Appears when `savingsRate >= 0.10` (10% saved)           |

---

## 9. Data Model (full schema)

```js
// localStorage key: 'abunda-data'
{
  version: 1,
  onboardingComplete: false,
  createdAt: 'YYYY-MM-DDTHH:mm:ssZ',

  budget: {
    monthlyIncome: 4000,          // base monthly income (number)
    categories: [
      {
        id: 'cat_savings',
        name: 'Savings',
        color: '#fbbf24',
        icon: 'sand-dollar',
        budgetAmount: 400,
        isSavings: true,
      },
      // ... other categories
    ],
  },

  transactions: [
    {
      id: 'txn_abc123',
      type: 'expense',            // 'expense' | 'income'
      amount: 45.50,
      categoryId: 'cat_food',    // null for income transactions
      note: 'Groceries',
      date: '2026-02-15',
      createdAt: '2026-02-15T14:30:00Z',
    },
  ],

  forecasts: [
    {
      id: 'fct_rent',
      name: 'Rent',
      amount: 1200,
      categoryId: 'cat_housing',
      frequency: 'monthly',
      nextDueDate: '2026-03-01',
      active: true,
    },
  ],

  goals: [],                     // reserved for Room 3 (Planning)
}
```

---

## 10. Future: Zero-Based Budgeting

When ready to add zero-based mode:

- Add a setting: `budget.mode: 'standard' | 'zero-based'`
- In zero-based mode, enforce: `sum(category.budgetAmount) == budget.monthlyIncome`
- Onboarding and the budget editor show a running "unallocated" balance
- The Cockpit compass points to "off course" if there are unallocated dollars
- No structural change to the data model is required — only validation logic changes

---

## 11. Out of Scope (v1)

- Multiple income sources tracked separately (only one base income + ad-hoc transactions)
- Debt tracking / liability accounts
- Multi-month history views (v1 shows current month only; data is retained)
- Budget rollover (unspent budget does not carry forward)
- Shared/household budgets (single user only)
- Currency conversion or multi-currency
- Bank/account sync (manual entry only)
