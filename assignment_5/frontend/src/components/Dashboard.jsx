import React from "react";
import TaskBoard from "./TaskBoard";
import GoalTracker from "./GoalTracker";
import FocusTimer from "./FocusTimer";
import Moodboard from "./Moodboard";

export default function Dashboard({ user, onLogout }) {
  return (
    <div
      className="app-container"
      style={{ padding: "24px", minHeight: "100vh" }}
    >
      {/* Upper Navigation Control Area */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Cipher Workspace</h1>
          <p style={{ margin: "4px 0 0 0", opacity: 0.6, fontSize: "14px" }}>
            Identity Context: {user?.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            background: "#e03131",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Disconnect Terminal
        </button>
      </header>

      {/* Primary CSS Grid Split Layout */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
      >
        {/* Left Column: Core Execution Blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <TaskBoard />
          <FocusTimer />
        </div>

        {/* Right Column: Visual Metrics and Sandbox Panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <GoalTracker />
          <Moodboard />
        </div>
      </div>
    </div>
  );
}
