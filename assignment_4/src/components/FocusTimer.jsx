import React, { useState } from "react";

export default function FocusTimer({
  timer,
  tasks,
  linkedTaskId,
  setLinkedTaskId,
}) {
  // Format calculation: converts flat integer seconds into readable 00:00 strings
  const minutes = Math.floor(timer.secondsLeft / 60);
  const seconds = timer.secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Filter out subtasks and fully finished tasks to populate the session selection list
  const activeTopTasks = tasks.filter(
    (task) => !task.parentId && !task.isCompleted,
  );
  const selectedTaskDetails = tasks.find((t) => t.id === linkedTaskId);

  return (
    <div
      style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center" }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>⏱️ Focus Countdown</h2>
      <p
        style={{
          color: timer.mode === "focus" ? "#646cff" : "#4caf50",
          textTransform: "uppercase",
          fontWeight: "bold",
          letterSpacing: "1.5px",
          fontSize: "0.9rem",
        }}
      >
        {timer.mode === "focus" ? "🎯 Focus Session Active" : "☕ Take A Break"}
      </p>

      {/* Main Digital Clock Display Face */}
      <div
        style={{
          fontSize: "5.5rem",
          fontWeight: "800",
          fontFamily: "monospace",
          background: "#1a1a1a",
          padding: "2rem",
          borderRadius: "12px",
          margin: "1.5rem 0",
          border: `2px solid ${timer.mode === "focus" ? "#646cff" : "#4caf50"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          letterSpacing: "-2px",
        }}
      >
        {formattedTime}
      </div>

      {/* Control Switch Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {!timer.isRunning ? (
          <button
            onClick={timer.start}
            style={{
              padding: "0.75rem 2rem",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          >
            Start Focus
          </button>
        ) : (
          <button
            onClick={timer.pause}
            style={{
              padding: "0.75rem 2rem",
              background: "#ffb703",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          >
            Pause Session
          </button>
        )}

        <button
          onClick={timer.reset}
          style={{
            padding: "0.75rem 2rem",
            background: "#222",
            color: "#aaa",
            border: "1px solid #444",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
          }}
        >
          Reset
        </button>
      </div>

      {/* BONUS FEATURE: Focus-on-Task Dropdown Linking Panel */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "1.25rem",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            color: "#888",
            marginBottom: "0.5rem",
            textAlign: "left",
          }}
        >
          Link Session to a Specific Objective:
        </label>
        <select
          value={linkedTaskId}
          onChange={(e) => setLinkedTaskId(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#111",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="">-- No Active Task Selected --</option>
          {activeTopTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>

        {timer.isRunning && selectedTaskDetails && (
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#aaa",
              background: "#222",
              padding: "0.5rem",
              borderRadius: "4px",
              fontStyle: "italic",
            }}
          >
            ⚡ Focusing on: <strong>"{selectedTaskDetails.title}"</strong>
          </div>
        )}
      </div>
    </div>
  );
}
