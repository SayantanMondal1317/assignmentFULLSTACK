// old code to test useLocalStorage
// the old value remains after refresh and re-opening
/*
import useLocalStorage from "./hooks/useLocalStorage";

export default function App() {
  const [count, setCount] = useLocalStorage("test-counter", 0);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Persistence Engine Test</h1>
      <p>
        Counter: <strong>{count}</strong>
      </p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
*/

import React from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import Dashboard from "./components/Dashboard";
import TaskBoard from "./components/TaskBoard";
import GoalTracker from "./components/GoalTracker";
import FocusTimer from "./components/FocusTimer";
import MoodBoard from "./components/MoodBoard";
import useTimer from "./hooks/useTimer";

export default function App() {
  // 1. Core Global States managed via our persistence layer
  const [activeSection, setActiveSection] = useLocalStorage(
    "cipher-active-section",
    "dashboard",
  );
  const [tasks, setTasks] = useLocalStorage("cipher-tasks", []);
  const [goals, setGoals] = useLocalStorage("cipher-goals", []);
  const [moodItems, setMoodItems] = useLocalStorage("cipher-mood-items", []);

  const [linkedTaskId, setLinkedTaskId] = useLocalStorage(
    "cipher-linked-task-id",
    "",
  );

  const timer = useTimer(25, 5);

  // 2. Dynamic Section Renderer
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard tasks={tasks} goals={goals} />;
      case "tasks":
        return <TaskBoard tasks={tasks} setTasks={setTasks} />;
      case "goals":
        return <GoalTracker goals={goals} setGoals={setGoals} />;
      case "timer":
        return (
          <FocusTimer
            timer={timer}
            tasks={tasks}
            linkedTaskId={linkedTaskId}
            setLinkedTaskId={setLinkedTaskId}
          />
        );
      case "mood":
        return <MoodBoard moodItems={moodItems} setMoodItems={setMoodItems} />;
      default:
        return <Dashboard tasks={tasks} goals={goals} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#121212",
        color: "#ffffff",
      }}
    >
      {/* Sidebar Navigation */}
      <nav
        style={{
          width: "240px",
          background: "#1a1a1a",
          padding: "2rem 1rem",
          borderRight: "1px solid #333",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            margin: "0 0 2rem 0",
            color: "#646cff",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          CIPHER
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
          {["dashboard", "tasks", "goals", "timer", "mood"].map((section) => (
            <li key={section} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => setActiveSection(section)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  background:
                    activeSection === section ? "#646cff" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontWeight: activeSection === section ? "600" : "400",
                  transition: "background 0.2s ease",
                }}
              >
                {section === "timer"
                  ? "⏱️ Focus Timer"
                  : section === "mood"
                    ? "🎨 Mood Board"
                    : section === "tasks"
                      ? "📋 Task Board"
                      : section === "goals"
                        ? "🎯 Goal Tracker"
                        : "📊 Dashboard"}
              </button>
            </li>
          ))}
        </ul>
        <div style={{ fontSize: "0.8rem", color: "#666", textAlign: "center" }}>
          MVP v1.0.0
        </div>
      </nav>

      {/* Main Content Window Area */}
      <main
        style={{
          flex: 1,
          padding: "2.5rem",
          overflowY: "auto",
          background: "#121212",
        }}
      >
        {renderSection()}
      </main>
    </div>
  );
}
