import React from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Dashboard from "./components/Dashboard";
import TaskBoard from "./components/TaskBoard";
import GoalTracker from "./components/GoalTracker";
import FocusTimer from "./components/FocusTimer";
import MoodBoard from "./components/MoodBoard";

export default function App() {
  // Navigation persistence via local storage [cite: 113]
  const [activeSection, setActiveSection] = useLocalStorage(
    "cipher_section",
    "tasks",
  );
  const [tasks, setTasks] = useLocalStorage("cipher_tasks", []);
  const [subtasks, setSubtasks] = useLocalStorage("cipher_subtasks", []);
  const [goals, setGoals] = useLocalStorage("cipher_goals", []);
  const [moodItems, setMoodItems] = useLocalStorage("cipher_mood", []);

  const renderContent = () => {
    switch (activeSection) {
      case "tasks":
        return (
          <TaskBoard
            tasks={tasks}
            setTasks={setTasks}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
          />
        );
      case "goals":
        return <GoalTracker goals={goals} setGoals={setGoals} />;
      case "focus":
        return <FocusTimer tasks={tasks} />;
      case "mood":
        return <MoodBoard moodItems={moodItems} setMoodItems={setMoodItems} />;
      default:
        return (
          <TaskBoard
            tasks={tasks}
            setTasks={setTasks}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
          />
        );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        background: "#f8f9fa",
        color: "#212529",
      }}
    >
      <Dashboard
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {renderContent()}
      </main>
    </div>
  );
}
