# Captain's Maps — Design Document

**Status:** Design v1
**Date:** 2026-02-17

---

## Concept

Captain's Maps is a life planning room. The environment is a wooden captain's table with nautical-style parchment maps spread across it. Each map is a free-form canvas where the user plots a financial life plan — goals, milestones, and waypoints connected by a hand-drawn route. A sailing ship marks "you are here," moving automatically along the route as real financial progress is made.

Where the Sorting Room tracks the present and the Cockpit reads current health, Captain's Maps looks forward: where are you going, how will you get there, and how far along are you?

---

## The Room

- **Background**: CSS-drawn wooden table (grain texture, warm brown tones)
- **Maps on table**: Multiple maps visible simultaneously, side by side or overlapping (z-ordered layers)
- **Parchment roll**: Always visible in a corner of the table. Clicking it creates a new blank map and places it on the table.
- **Tab position**: Center (3rd of 5)
- **Tab icon**: Ship's wheel

---

## A Map

### Visual Style

- Aged parchment background (warm cream/tan, slight vignette at edges)
- Hand-drawn ink aesthetic: waypoint markers, path lines, labels
- Optional compass rose decoration in a corner
- Slightly rough/torn edges (CSS border treatment)
- User-editable title shown at the top of the map

### Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  Map Title                                  [⚙] [✕]     │  ← editable title, settings, close
│                                                          │
│    ★ Waypoint A ──────────── ★ Waypoint B               │  ← objects on canvas
│         │                         │                      │
│     [goal: $5k]              [goal: $15k]               │
│                                                          │
│   ⛵                                                     │  ← ship (you are here)
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌         │  ← user-drawn path
│                                                          │
│  ○ Custom object                                         │  ← non-data object
│    "Buy a kayak"                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Objects (Features on a Map)

The user places objects on the map canvas. Two types exist:

### 1. Waypoints

A waypoint is a point along the route with an optional financial goal attached. Waypoints are the primary data-connected object — they determine how far the ship has traveled.

**Properties:**
- Position on map (x, y)
- Label (user-defined, e.g. "Pay off car loan")
- Goal type: `savings` | `debt` | `custom` | none
- Target value (optional, e.g. $8,000)
- Target date (optional, e.g. 2026-12-01)
- Data link (future: link to a specific category)

**Ship position logic:**
- If a waypoint has a `targetValue`: progress = `actualValue / targetValue` (clamped 0–1)
- If a waypoint has only a `targetDate`: progress = `daysElapsed / totalDays` (clamped 0–1)
- If a waypoint has neither: waypoint is decorative — ship passes it at user-defined progress
- Ship is interpolated along the path between waypoints proportionally to progress

**Example:**
> "Save $10,000 for emergency fund" — targetValue: 10000
> User has saved $4,200 → ship is 42% of the way from previous waypoint to this one

### 2. Custom Objects

Freeform elements with no automatic data connection. The user defines what they mean.

**Properties:**
- Position on map (x, y)
- Icon (from a picker — anchor, house, star, flag, etc.)
- Label
- Note / description
- User-defined meaning (free text: "this represents X")

---

## The Ship (You Are Here)

- CSS-drawn sailing ship icon placed on the map canvas
- Positioned along the user-drawn path
- Position is **calculated on render** (not stored) from waypoint progress
- If no waypoints have values, ship stays at the path start until manually moved
- Gentle bob animation (CSS keyframe, subtle vertical oscillation)

---

## The Path

- The user draws a route by clicking/dragging to create line segments
- The path is an ordered series of (x, y) points rendered as an SVG polyline overlay
- Visual style: ink-like stroke, slightly irregular (can use SVG filter for roughness)
- Waypoints snap to the path when placed
- Path can be redrawn or extended at any time (with full undo support)
- Path direction = time direction (start = now, end = future)

---

## Map Management

Multiple maps can coexist on the table:

| Action | How |
|--------|-----|
| Create | Click parchment roll in corner |
| Move | Drag map by its title bar |
| Resize | Drag corner handle |
| Layer | Maps have a z-index; clicking a map brings it to front |
| Remove | Click ✕ button on map (with confirmation) |

---

## Edit History (Undo / Redo)

Every action on a map is recorded as a serializable state snapshot:

- Place object, move object, draw path segment, edit label, delete object
- `Cmd+Z` / `Ctrl+Z` — undo
- `Cmd+Shift+Z` / `Ctrl+Y` — redo
- History is bounded to the last 100 actions per map
- History persists in localStorage alongside the map state

---

## Data Model

Stored under `captainsMaps` in `abunda-data`:

```js
captainsMaps: [
  {
    id: 'map_abc123',
    title: 'Financial Freedom Route',
    tablePosition: { x: 20, y: 30 },     // position on the table
    tableSize: { width: 600, height: 400 },
    zIndex: 1,

    path: [
      { x: 50, y: 300 },
      { x: 200, y: 150 },
      { x: 420, y: 100 },
      { x: 560, y: 220 },
    ],

    objects: [
      {
        id: 'obj_abc',
        type: 'waypoint',
        position: { x: 200, y: 150 },
        label: 'Emergency fund',
        goalType: 'savings',
        targetValue: 10000,
        targetDate: '2026-12-01',
        dataLink: null,                   // future: link to category ID
      },
      {
        id: 'obj_def',
        type: 'waypoint',
        position: { x: 420, y: 100 },
        label: 'Pay off car',
        goalType: 'debt',
        targetValue: 8000,
        targetDate: null,
        dataLink: null,
      },
      {
        id: 'obj_ghi',
        type: 'custom',
        position: { x: 100, y: 280 },
        icon: 'anchor',
        label: 'Buy a kayak',
        note: 'When emergency fund is full',
        userDefinedMeaning: 'A reward milestone',
      },
    ],

    history: [
      // array of full map state snapshots (objects + path), bounded to 100
    ],

    createdAt: '2026-02-17T00:00:00Z',
    updatedAt: '2026-02-17T00:00:00Z',
  },
],
```

---

## Navigation Order (5 Rooms)

| Position | Room | Icon | Purpose |
|----------|------|------|---------|
| 1 | Shore | Wave | Daily snapshot |
| 2 | Sorting Room | Basket | Log expenses |
| 3 | **Captain's Maps** | **Ship's wheel** | **Life planning** |
| 4 | Cockpit | Compass dial | Financial awareness |
| 5 | Under the Sea | Coral | Deep data exploration |

---

## Implementation Notes

- Map canvas: `position: relative` div; objects are `position: absolute` children
- Path rendering: SVG overlay (`position: absolute`, full map size) with `<polyline>`
- Drag for objects: `mousedown` / `mousemove` / `mouseup` on each object
- Path drawing: click-to-add-points mode toggled by a "draw path" button
- Ship position: calculated fresh on each render from waypoint progress
- Undo history: store full map state (objects + path) as JSON snapshots in an array
- Parchment roll: fixed-position CSS element in the table corner

---

## Implementation Phase

Phase 7 (after Under the Sea). Dependencies:
- Sorting Room must exist (transaction data feeds waypoint progress)
- State layer must support `captainsMaps[]` array
