# Cipher — Modular Productivity Workspace MVP

Cipher is a high-performance, single-page productivity dashboard built completely in vanilla **React**. It features real-time macro-goal telemetry, localized subtask cascading hierarchies, a global background focus engine, and a dynamic inspiration mood board—all executing smoothly on a lightweight, state-driven architecture.

---

## Key Features

- **Executive Dashboard:** Real-time metrics calculating total cleared tasks and global macro-goal alignment via derived state equations.
- **Hierarchical Task Board:** Flat-array task engine supporting cascading subtask creation, completion counters (`1/2 Done`), a 400ms CSS animation exit sweep, and a collapsible archive drawer with a permanent manual purge control.
- **Metric Goal Tracker:** Quantifiable macro-target rows complete with clamped increment/decrement click controllers and linear gradient progress trackers.
- **Persistent Focus Timer:** A background-ticking countdown machine built on a custom hook wrapper that keeps processing state across route switches and locks onto specific board objectives.
- **Inspiration Mood Board:** An intelligent grid canvas that auto-detects inputs (HEX codes, valid web images, or text) to render custom pinned visual cards.

---

## Technical Design Constraints & Architecture

This application was engineered under strict production constraints to prove the power of foundational React state mechanics over heavy external state managers.

- **Zero External Global State:** Completely free of `Context API`, `Redux`, or `Zustand`. All state updates are driven by unified array mutators and standard parent-to-child **Prop Drilling**.
- **Normalized Flat State Arrays:** Subtasks do not use deep object nesting. They live safely in a flat task array mapped via `parentId` links to eliminate nested mutation rendering bugs.
- **Pure Derived States:** Complex data operations like tracking daily deadlines, computing goal percentages, or aggregating metrics are calculated **on-the-fly during the render cycle** rather than syncing to extra duplicate states.
- **Unified Persistence Layer:** Custom hooks sync memory state dynamically into `localStorage`, keeping user data perfectly preserved across page reloads.
- **Explicit Purge Lifecycle:** Completed items transition out of active columns into a low-priority archive drawer. To maximize performance and prevent accidental state loss, items retain relational integrity with subtasks until an explicit garbage-collection sweep is triggered by the user via the "Clear Archive" filter, permanently flushing records from the active local workspace array.

---

## Installation & Local Setup

To spin up this workspace environment locally, ensure you have [Node.js](https://nodejs.org/) installed, then execute the following sequence in your terminal:

1. **Initialize the Vite React Boilerplate:**

```bash
npm create vite@latest . -- --template react
```

2. **Install Project Dependencies:**

```bash
npm install
```

3. **Boot Up the Local Live Development Server:**

```bash
npm run dev
```

Open your local browser to the outputted URL (typically http://localhost:5173) to view the workspace interface.

---

## Project Architecture & Directory Layout

The workspace is organized using a highly modular component structure separating global custom React hooks, layout modules, and UI rendering layers.

```plaintext
src/
├── components/
│   ├── Dashboard.jsx       # Aggregated metrics & daily priority view
│   ├── FocusTimer.jsx      # Countdown view & task linking engine
│   ├── GoalTracker.jsx     # Quantifiable macro-goal panels & counters
│   ├── MoodBoard.jsx       # Freeform CSS inspiration masonry grid
│   └── TaskBoard.jsx       # Dynamic date-grouped columns, subtask logic, & completion archive
├── hooks/
│   ├── useLocalStorage.js  # Lazy-loaded, tab-synchronized persistence layer
│   └── useTimer.js         # Memory-safe background countdown hook engine
├── App.jsx                 # Single Source of Truth & root layout routing shell
├── main.jsx                # React DOM virtual root mounter
└── index.css               # Global dark-mode viewport normalization stylings
```

---

## Data Schemas & State Shapes Spec

To support a zero-Context prop-drilled architecture and prepare for future database normalization, the application maintains completely flat state arrays. Relational mapping is achieved using unique reference pointers (parentId) instead of multi-layered object nesting.

1. Task Object Schema
   All tasks and subtasks live in the same primary array. A subtask is identified simply by having a non-null parentId matching its parent's unique ID code.

```JSON
{
  "id": "crypto-uuid-or-timestamp-string",
  "title": "Build out custom useLocalStorage hook",
  "deadline": "2026-06-30", // Saved as ISO YYYY-MM-DD string or null
  "isCompleted": false,
  "parentId": null // String ID if it is a subtask; null if a top-level task
}
```

State Cleanup Note: When a user triggers the archive purge action, the array filter execution performs a clean sweep targeting all entries matching isCompleted: true. This deletes both completed parent records and their respective subtasks in a single state mutation step.

2. Goal Object Schema
   Tracks quantifiable macro-targets with native integer boundaries clamped at the component layer to prevent out-of-bounds anomalies.

```JSON
{
  "id": "goal-unique-uuid-string",
  "title": "Solve LeetCode Problems",
  "targetNumber": 50, // Maximum metric target boundary
  "currentNumber": 12, // Current tracking integer increment
  "targetDate": "2026-12-31" // Target line deadline or null
}
```

3. Mood Item Schema
   Maintains inspiration tiles by dynamically parsing raw input strings into color variables, valid web assets, or alphanumeric reflections.

```JSON
{
  "id": "mood-unique-uuid-string",
  "type": "color", // Enumerated type: 'color' | 'image' | 'text'
  "value": "#FFB703" // Hex string, URL source path, or textual commentary
}
```

---

## Core Engine Breakdown (Custom Hooks)

The core mechanics of Cipher rely on two specialized, self-contained custom hooks designed to handle complex background processes and state synchronization efficiently.

### 1. The Persistence Engine (`useLocalStorage.js`)

- Rather than calling basic side-effects on every render, this production-grade synchronization hook handles disk reads lazily and guards against data corruption.

```javascript
// Crucial Technical Design Highlights inside the hook:

// A. Lazy State Initializer
const [storedValue, setStoredValue] = useState(() => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    return initialValue; // Fallback prevents app-crash if local string is corrupted
  }
});

// B. Native Cross-Tab Synchronization
useEffect(() => {
  const handleStorageChange = (event) => {
    if (event.key === key) {
      setStoredValue(
        event.newValue ? JSON.parse(event.newValue) : initialValue,
      );
    }
  };
  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, [key, initialValue]);
```

- Performance Optimization: Disk access via localStorage.getItem is heavy. By leveraging a lazy functional initializer inside useState, the disk is read exactly once when the component mounts, rather than on every re-render cycle.

- Cross-Tab Sync: Utilizing the native browser storage event listener ensures that if a user opens Cipher in multiple browser tabs simultaneously, toggling a task complete in Tab A instantly and automatically updates Tab B in real-time.

- Purge Synchronization: When a user executes a "Clear Archive" sweep, the hook's setter instantly commits the streamlined array to disk. The native cross-tab listener intercepts this mutation, ensuring the archive is completely flushed across all open browser instances without requiring manual page refreshes.

### 2. The Global Background Execution Machine (`useTimer.js`)

To satisfy the constraint that the countdown clock must remain active even when navigating away from the timer view, this engine utilizes clean browser intervals lifted to the application root.

State Routing Immunity: By initializing `useTimer` globally within App.jsx, the state loop continues updating in memory even when the visual router completely unmounts the `<FocusTimer />` component view.

Memory Leak Mitigation: The hook implements a strict useEffect cleanup return statement ensuring `clearInterval(interval)` fires instantly upon pause or engine destruction, completely neutralizing background thread memory leaks.

---

## Feature Module Highlights & Derived Algorithmic Logic

Cipher minimizes memory overhead by running intensive computations dynamically during the component render pass rather than storing duplicate values in React state.

### 1. Dynamic Date-Grouping Algorithm (`TaskBoard.jsx`)

Instead of rewriting task locations to disk when dates change, the system passes the raw array through a pure parsing function. Deadlines are evaluated against local time strings formatted using the ISO standard variant (`YYYY-MM-DD`).

```javascript
const groupTasks = (taskList) => {
  const todayStr = new Date().toLocaleDateString("en-CA"); // Yields stable YYYY-MM-DD
  const groups = { overdue: [], today: [], upcoming: [], noDate: [] };

  taskList.forEach((task) => {
    if (task.parentId || task.isCompleted) return; // Ignore children and closed items

    if (!task.deadline) {
      groups.noDate.push(task);
    } else if (task.deadline < todayStr) {
      groups.overdue.push(task);
    } else if (task.deadline === todayStr) {
      groups.today.push(task);
    } else {
      groups.upcoming.push(task);
    }
  });
  return groups;
};
```

### 2. Cascading Subtask Mechanics (`TaskBoard.jsx`)

To avoid nested pointer mutations, subtask actions dynamically re-evaluate or filter the top-level array layout across four key interactions:

- Cascading Downward Completion: Checking a parent task triggers a map event that automatically forces all matching child records (`task.parentId === parentId`) to match the parent's new completion state.
- Upward Reactive Evaluation: Checking off an individual subtask scans all sibling records. If every child under that parentId evaluates to isCompleted: true, the system automatically flags the parent as complete and initiates the 400ms visual fade-out sequence.
- Cascading Deletion: Removing an active parent task uses a single `.filter()` call to instantly purge the parent and delete all orphans:

```JavaScript
setTasks((prev) => prev.filter((t) => t.id !== id && t.parentId !== id));
```

- Relational Archive Purging: When permanently flushing the completion drawer, the global mutator utilizes a flat `.filter((task) => !task.isCompleted)` pass. Because subtasks inherit the completion flag of their parent during down-cascading, this single execution cleanly destroys both layers at once, ensuring zero orphan nodes are left behind in localStorage.

### 3. Metric Boundary Clamping (`GoalTracker.jsx`)

To ensure mathematical integrity across goal tracking progress meters, click updates are bound using functional clamping constraints to prevent out-of-bounds UI breakage:

- Increment Guard: Progress counts stop instantly once `currentNumber === targetNumber`.
- Decrement Guard: Structural constraints block metrics from dropping below 0.
- Percentage Guard: Percent computations are dynamically clamped using standard mathematical limits to shield layouts from division-by-zero errors:

```JavaScript
const percent =
  Math.min(Math.round((goal.currentNumber / goal.targetNumber) * 100), 100) || 0;
```

### 4. Intelligent Asset Input Detection (`MoodBoard.jsx`)

The inspiration panel features an input router that runs incoming strings through standard regular expression rules to determine how to draw the container item:

```JavaScript
const detectType = (str) => {
  const cleanStr = str.trim();

  // Rule A: Hex code recognition
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(cleanStr)) return "color";

  // Rule B: Media asset matching
  if (cleanStr.startsWith("http://") || cleanStr.startsWith("https://")) {
    if (cleanStr.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) return "image";
  }

  // Rule C: Text layout fallback
  return "text";
};
```

---

## Component Topology & Interface Contracts

Because this workspace relies entirely on vanilla state lifting and standard prop drilling without an external state broker, maintaining a rigid, predictable unidirectional data highway is critical. Below is the structural hierarchy mapping out how data streams downward from the primary application shell container.

### 1. View Tree Hierarchy

```plaintext
App.jsx (Single Source of Truth)
├── Dashboard.jsx (Consumes derived stats & daily lists)
├── TaskBoard.jsx (Manages grid columns, subtasks, & archive engine)
├── GoalTracker.jsx (Manages macro numeric targets & clamping filters)
├── FocusTimer.jsx (Consumes background interval hooks & bonds to active tasks)
└── MoodBoard.jsx (Parses regex visual strings & handles card removal)
```

### 2. Interface Prop Signatures

To ensure strict compliance with our normalized flat data structure, each module communicates across a explicitly defined interface contract:

| Component Module  | Inbound Props Signature                                | Component Responsibility                                                                                                                                      |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dashboard.jsx`   | `tasks={tasks}`, `goals={goals}`                       | Computes render-time aggregates for global performance telemetry indexes and highlights outstanding items due today.                                          |
| `TaskBoard.jsx`   | `tasks={tasks}`, `setTasks={setTasks}`                 | Handles top-level task insertion, transactional child mutations, execution exit animations, and manages the collapsible/purgeable archive drawer state.       |
| `GoalTracker.jsx` | `goals={goals}`, `setGoals={setGoals}`                 | Evaluates current vs target integer metrics, governs strict boundary clipping (no negative bounds), and draws dynamic linear-gradient layout meters.          |
| `FocusTimer.jsx`  | `tasks={tasks}`, `timerProps={...}`                    | Connects with the parent hook interval engine, lets users optionally bind the current session countdown to an active task node, and displays status controls. |
| `MoodBoard.jsx`   | `moodItems={moodItems}`, `setMoodItems={setMoodItems}` | Listens for string patterns, pushes parsed media configurations to state layouts, and handles masonry item removal actions.                                   |

---

## Verification Matrix & Critical Test Workflows

To ensure the integrity of Cipher’s zero-Context data highway, the following playbook details the exact step-by-step manual testing procedures required to verify state synchronization, functional boundary clamping, and relational cascading logic.

### 1. Unified System Testing Matrix

| Target Subsystem         | Interaction Test Pattern                                       | Under-the-Hood State Evaluation                                                     | Expected Behavioral Result                                                                                                                                                                          |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task Engine**          | Click parent checkbox                                          | Fires downward relational map targeting all matching `parentId` records.            | Parent and child text elements immediately apply `.is-strikethrough`. After a 400ms render delay, opacity sweeps to `0` (`.is-fading`), and items drop out of active views into the archive drawer. |
| **Subtask Grid**         | Check off final remaining incomplete subtask                   | Triggers upward reactive scan filtering all sibling items with matching `parentId`. | The system determines that all sibling subtasks evaluate to `isCompleted: true`, automatically flags the top-level parent task as complete, and triggers its 400ms exit timeline.                   |
| **Archive Purge Engine** | Click the "Clear Archive" button inside history                | Executes a destructive JavaScript window confirm intercept before modifying state.  | Prevents execution if canceled. On confirmation, runs a global array filter (`!task.isCompleted`), flushing entries from the active local workspace array and disk.                                 |
| **Goal Tracker**         | Click the minus (`-`) decrement controller when count is `0`   | Passes the calculation through a lower boundary structural constraint check.        | Component blocks value updates below `0`. The tracking indicator locks at `0` without breaking progress meter rendering layouts.                                                                    |
| **Focus Counter**        | Start a 25-minute timer, switch view to Dashboard, then return | Background interval execution remains mounted at the root (`App.jsx`) layer.        | The clock continues running smoothly in the background. Returning to the Focus view reveals accurate, real-time decremented countdown time strings.                                                 |
| **Mood Board**           | Input an image URL missing an active CORS/hotlink header       | Triggers the native `onError` event handler attached to the target image node.      | The broken image icon layout collapses cleanly via `display: none`. A stylized, safe typography fallback message appears within the card block automatically.                                       |

---

### 2. High-Priority Workflow Testing Procedures

#### A. The Relational Cascade & Garbage Collection Sweep

1. Navigate to the **Task Board** and create a main task named `Root Objective`.
2. Append three individual subtasks underneath it using the nested inline form field.
3. Mark two subtasks complete; confirm they apply localized line-through styling but stay active in the layout column view.
4. Mark the final subtask complete. Observe the upward evaluation automatically checking the parent `Root Objective`.
5. Verify the entire cluster undergoes the 400ms synchronized fade-out animation and relocates to the completed history view.
6. Open the history archive drawer, click **Clear Archive**, click OK on the browser prompt, and verify your `localStorage` key is completely streamlined.

#### B. Division-by-Zero Structural Resilience

1. Navigate to the **Goal Tracker** module viewport.
2. Click the addition controls to generate a macro target with a target quantity value configured explicitly to `0`.
3. Verify that instead of outputting `NaN%` or crashing the virtual DOM layout tree, the percent computation handles the empty denominator safely, reverting cleanly to a default rendering of `0%`.

---

## Viewport Normalization & UI Design Token System

To eliminate inline style pollution and ensure a consistent aesthetic across all layout views, Cipher consolidates its visual presentation layer into a centralized stylesheet (`src/index.css`). The workspace adheres to an optimized low-fatigue dark UI spec built on modern CSS layout engines.

### 1. Centralized CSS Layout Tokens

The layout uses a structured color palette and layout token framework to drive standard visual hierarchies across all responsive viewports:

```css
/* Core Structural Tokens inside index.css */
:root {
  --bg-primary: #121212;
  --bg-surface: #1a1a1a;
  --bg-card-active: #222222;
  --text-main: #ffffff;
  --text-muted: #888888;

  /* Brand Accent Signatures */
  --accent-purple: #646cff;
  --accent-green: #4caf50;
  --accent-amber: #ffb703;
  --accent-red: #ff4a4a;
}
```

### 2. Main Layout & Component Architecture Classes

Every inline layout container throughout the refactoring pass has been migrated directly into these high-performance, scannable semantic utility classes:

#### A. Application Shell Framework

- `.app-container`: Utilizes a full-height layout (`min-height: 100vh`) using CSS Flexbox to anchor the navigation sidebar and content windows smoothly.
- `.sidebar`: A fixed `240px` architectural container incorporating internal padding and subtle boundaries (`border-right: 1px solid #333`) to house section controllers.
- `.main-content`: A scroll-isolated, flexible layout node (`overflow-y: auto`) that provides uniform page padding across changing component views.

#### B. Dashboard & Metrics Typography

- `.metric-grid`: An elastic layout array mapping data cards evenly via auto-fit properties:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 1.5rem;
```

- `.metric-card`: Structured surface boxes featuring integrated corner geometry definitions (`border-radius: 10px`) and distinct outer board definitions.
- `.priority-panel` & `.priority-item`: Standardized priority listings highlighted using custom side indicators (`border-left: 4px solid var(--accent-amber)`).

#### C. Relational Task Board Columns

- `.board-grid`: Coordinates a fixed column system mapping the four key timeline categories seamlessly:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
gap: 1.25rem;
```

- `.board-column`: Self-contained column panels that cleanly structure lists, keeping overflow behaviors visually contained.

#### D. Focus Engine Displays

- `.timer-container`: A centered viewport component containing specialized text scaling properties to highlight time markers.
- `.timer-face`: A monospace clock readout wrapped in a high-contrast border state tracking line that updates color based on the current interval mode:

```css
/* Active State Toggles */
.timer-face {
  border-color: var(--accent-purple);
}
.timer-face.break {
  border-color: var(--accent-green);
}
```

#### E. Mood & Inspiration Canvas

- `.mood-grid`: Leverages a fluid masonry-style pattern to pack items compactly regardless of variation in content volume:

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
gap: 1.25rem;
```

- `.mood-card`: A multi-purpose preview container featuring clean overflow cropping and native image aspect ratio standardizations.

---

## Architectural Evolution Roadmap (Backend Integration Readiness)

Cipher's frontend architecture was deliberately designed to serve as a decoupled client layer ready for seamless database and API synchronization. As the workspace evolves beyond a localized application, the state hooks are positioned for an enterprise upgrade pattern.

### 1. Migrating to a Stateless Client Layer

Currently, the application handles data storage using synchronous client-side disk writes via `useLocalStorage`. Upgrading to a distributed server infrastructure involves intercepting the root state handlers inside `App.jsx` and routing updates through an asynchronous network layer:

- **Initial Bootstrapping:** Replace lazy local initializers with secure `GET` queries dispatched via an asynchronous fetching loop when the root viewport mounts.
- **Optimistic UI Rendering:** Retain Cipher’s highly responsive 400ms completion and fade animations by applying client-side state changes optimistically before waiting for server-side transactional network confirmations.

### 2. Relational Mapping & Schema Alignment

The decision to maintain completely flat state arrays connected via reference pointers (`parentId`) directly corresponds to standard relational database architectures. This schema translates into standard configurations for tools like PostgreSQL using Prisma ORM:

```prisma
// Conceptual Prisma Schema Mapping for the Relational Task Engine
model Task {
  id          String   @id @default(uuid())
  title       String
  deadline    String?
  isCompleted Boolean  @default(false)
  parentId    String?
  parent      Task?    @relation("TaskHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  subtasks    Task[]   @relation("TaskHierarchy")
}
```

### 3. Session Security Architecture

The persistence hook can be adjusted to store short-lived JSON Web Tokens (JWT) instead of full feature data arrays. This allows the client to securely communicate across protected API endpoints, paving the way for multi-user profile workspaces and real-time cross-device data updates.

---
