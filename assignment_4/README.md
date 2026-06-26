# 🌌 Cipher — Modular Productivity Workspace MVP

Cipher is a high-performance, single-page productivity dashboard built completely in vanilla **React**. It features real-time macro-goal telemetry, localized subtask cascading hierarchies, a global background focus engine, and a dynamic inspiration mood board—all executing smoothly on a lightweight, state-driven architecture.

---

## 🚀 Key Features

- 📊 **Executive Dashboard:** Real-time metrics calculating total cleared tasks and global macro-goal alignment via derived state equations.
- 📋 **Hierarchical Task Board:** Flat-array task engine supporting cascading subtask creation, completion counters (`1/2 Done`), and a 400ms CSS animation exit sweep.
- 🎯 **Metric Goal Tracker:** Quantifiable macro-target rows complete with clamped increment/decrement click controllers and linear gradient progress trackers.
- ⏱️ **Persistent Focus Timer:** A background-ticking countdown machine built on a custom hook wrapper that keeps processing state across route switches and locks onto specific board objectives.
- 🎨 **Inspiration Mood Board:** An intelligent grid canvas that auto-detects inputs (HEX codes, valid web images, or text) to render custom pinned visual cards.

---

## 🛠️ Technical Design Constraints & Architecture

This application was engineered under strict production constraints to prove the power of foundational React state mechanics over heavy external state managers.

- **Zero External Global State:** Completely free of `Context API`, `Redux`, or `Zustand`. All state updates are driven by unified array mutators and standard parent-to-child **Prop Drilling**.
- **Normalized Flat State Arrays:** Subtasks do not use deep object nesting. They live safely in a flat task array mapped via `parentId` links to eliminate nested mutation rendering bugs.
- **Pure Derived States:** Complex data operations like tracking daily deadlines, computing goal percentages, or aggregating metrics are calculated **on-the-fly during the render cycle** rather than syncing to extra duplicate states.
- **Unified Persistence Layer:** Custom hooks sync memory state dynamically into `localStorage`, keeping user data perfectly preserved across page reloads.

---

## ⚙️ Installation & Local Setup

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

## 📁 Project Architecture & Directory Layout

The workspace is organized using a highly modular component structure separating global custom React hooks, layout modules, and UI rendering layers.

```plaintext
src/
├── components/
│   ├── Dashboard.jsx       # Aggregated metrics & daily priority view
│   ├── FocusTimer.jsx      # Countdown view & task linking engine
│   ├── GoalTracker.jsx     # Quantifiable macro-goal panels & counters
│   ├── MoodBoard.jsx       # Freeform CSS inspiration masonry grid
│   └── TaskBoard.jsx       # Dynamic date-grouped columns & subtask logic
├── hooks/
│   ├── useLocalStorage.js  # Lazy-loaded, tab-synchronized persistence layer
│   └── useTimer.js         # Memory-safe background countdown hook engine
├── App.jsx                 # Single Source of Truth & root layout routing shell
├── main.jsx                # React DOM virtual root mounter
└── index.css               # Global dark-mode viewport normalization stylings
```

---

## 📊 Data Schemas & State Shapes Spec

To support a zero-Context prop-drilled architecture and prepare for future database normalization, the application maintains completely **flat state arrays**. Relational mapping is achieved using unique reference pointers (`parentId`) instead of multi-layered object nesting.

### 1. Task Object Schema

All tasks and subtasks live in the same primary array. A subtask is identified simply by having a non-null `parentId` matching its parent's unique ID code.

```json
{
  "id": "crypto-uuid-or-timestamp-string",
  "title": "Build out custom useLocalStorage hook",
  "deadline": "2026-06-30", // Saved as ISO YYYY-MM-DD string or null
  "isCompleted": false,
  "parentId": null // String ID if it is a subtask; null if a top-level task
}
```

### 2. Goal Object Schema

Tracks quantifiable macro-targets with native integer boundaries clamped at the component layer to prevent out-of-bounds anomalies.

```json
{
  "id": "goal-unique-uuid-string",
  "title": "Solve LeetCode Problems",
  "targetNumber": 50, // Maximum metric target boundary
  "currentNumber": 12, // Current tracking integer increment
  "targetDate": "2026-12-31" // Target line deadline or null
}
```

### 3. Mood Item Schema

Maintains inspiration tiles by dynamically parsing raw input strings into color variables, valid web assets, or alphanumeric reflections.

```json
{
  "id": "mood-unique-uuid-string",
  "type": "color", // Enumerated type: 'color' | 'image' | 'text'
  "value": "#FFB703" // Hex string, URL source path, or textual commentary
}
```

---

## ⚙️ Core Engine Breakdown (Custom Hooks)

The core mechanics of Cipher rely on two specialized, self-contained custom hooks designed to handle complex background processes and state synchronization efficiently.

### 1. The Persistence Engine (`useLocalStorage.js`)

Rather than calling basic side-effects on every render, this production-grade synchronization hook handles disk reads lazily and guards against data corruption.

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

### 2. The Global Background Execution Machine (`useTimer.js`)

To satisfy the constraint that the countdown clock must remain active even when navigating away from the timer view, this engine utilizes clean browser intervals lifted to the application root.

- State Routing Immunity: By initializing useTimer globally within App.jsx, the state loop continues updating in memory even when the visual router completely unmounts the `<FocusTimer />` component view.

- Memory Leak Mitigation: The hook implements a strict useEffect cleanup return statement ensuring clearInterval(interval) fires instantly upon pause or engine destruction, completely neutralizing background thread memory leaks.

---

## 🧩 Feature Module Highlights & Derived Algorithmic Logic

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

To avoid nested pointer mutations, subtask actions dynamically re-evaluate or filter the top-level array layout across three key interactions:

Cascading Downward Completion: Checking a parent task triggers a map event that automatically forces all matching child records (`task.parentId === parentId`) to match the parent's new completion state.

Upward Reactive Evaluation: Checking off an individual subtask scans all sibling records. If every child under that parentId evaluates to `isCompleted: true`, the system automatically flags the parent as complete and initiates the 400ms visual fade-out sequence.

Cascading Deletion: Removing a parent task uses a single `.filter()` call to instantly purge the parent and delete all orphans:

```javascript
setTasks((prev) => prev.filter((t) => t.id !== id && t.parentId !== id));
```

### 3. Metric Boundary Clamping (`GoalTracker.jsx`)

To ensure mathematical integrity across goal tracking progress meters, click updates are bound using functional clamping constraints to prevent out-of-bounds UI breakage:

- Increment Guard: Progress counts stop instantly once `currentNumber === targetNumber`.
- Decrement Guard: Structural constraints block metrics from dropping below 0.
- Percentage Guard: Percent computations are dynamically clamped using standard mathematical limits to shield layouts from division-by-zero errors:

```javascript
const percent =
  Math.min(Math.round((goal.currentNumber / goal.targetNumber) * 100), 100) ||
  0;
```

### 4. Intelligent Asset Input Detection (`MoodBoard.jsx`)

The inspiration panel features an input router that runs incoming strings through standard regular expression rules to determine how to draw the container item:

```javascript
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
