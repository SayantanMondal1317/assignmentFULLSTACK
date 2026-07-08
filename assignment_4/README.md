# Cipher MVP - Standalone Frontend Client

A reactive, component-driven daily productivity dashboard built with React and Vite. This application operates entirely on the client side, leveraging optimized browser storage engines and a flat relational state model to deliver a persistent, seamless desktop utility experience without requiring an external database.

---

## System Features Mapping

The client architecture satisfies all core specifications by leveraging pure React state mechanics:

- **P0: Local Persistence Layer:** Built around a custom synchronous pipeline that automatically captures, serializes, and commits state updates to the browser's `localStorage` API, ensuring data survives hard page refreshes.
- **P1: Relational Task Board:** Models tasks and subtasks using a flat relational state layout. Subtasks reference their parent task using a `parentId` attribute rather than nested object trees, mirroring the structure of standard database tables.
- **Dynamic Time Grouping:** To maintain a clean state, task sorting into specific sections (`Overdue`, `Today`, `Upcoming`, `No Date`, `Completed`) is treated as a derived value computed on-the-fly at render time instead of being preserved in separate state variables.
- **P2: Goal Tracker:** Tracks linear progress indicators using metric objectives, enabling incremental adjustments that persist directly in local client memory.
- **P3: Focus Timer:** A stateful countdown utility designed around specific time intervals. It implements functional side-effects (`useEffect`) to link active intervals directly with open, incomplete tasks.
- **P4: Freeform Mood Board:** A creative visual grid supporting raw color hexadecimal codes and dynamic image asset URLs, providing immediate aesthetic workspace layouts.

---

## Architectural Implementation Choices

### Flat Relational State Layout

Instead of managing nested JSON structures for tasks and subtasks, this application utilizes flat arrays for child objects:

```javascript
const tasks = [{ id: "task-1", title: "Complete Calculus Sheet" }];
const subtasks = [
  { id: "sub-1", parentId: "task-1", title: "Solve Q3", completed: false },
];
```

This design choice ensures that the data structure remains highly readable, simplifies state manipulation logic inside React, and aligns perfectly with relational schema paradigms for seamless future backend migrations.

### Derived State Computation

Categorizing tasks by their deadlines is calculated during the rendering phase rather than tracking group statuses explicitly in state variables. This eliminates state synchronization bugs, lowers memory consumption, and guarantees that categorization accurately updates relative to the changing calendar date.

## Installation & Setup

### Prerequisites

- Node.js installed locally on your system.

### Running the Application Local Instance

1. Extract the project workspace and navigate into the frontend directory:

```Bash
cd frontend
```

2. Install the necessary development and runtime dependencies:

```Bash
npm install
```

3. Boot the local development server utilizing Vite:

```Bash
npm run dev
```

4. Open your web browser and navigate to the local address provided in your terminal output (typically http://localhost:5173).

## Data Management & Lifecycle

All application data is securely contained inside the user's specific browser instance:

- Storage Allocation: Data is isolated per domain origin using stringified JSON blobs.

- State Updates: Modifying a task status, editing text fields, or adding elements to the mood board initiates a single directional state change. This change updates the view layer and triggers a storage synchronization side-effect in one atomic lifecycle loop.
