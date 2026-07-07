import React from "react";

export default function FocusTimer({
  timer,
  tasks = [], // Fallback default parameter to guarantee it's always iterable
  linkedTaskId,
  setLinkedTaskId,
}) {
  // Prevent crashes if the timer object hasn't been initialized by the parent component yet
  const secondsLeft = timer?.secondsLeft ?? 0;
  const currentMode = timer?.mode ?? "focus";
  const isRunning = timer?.isRunning ?? false;

  // Format calculation: converts flat integer seconds into readable 00:00 strings
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // CRASH PROTECTION: Ensure tasks exists and is an array before filtering
  const activeTopTasks = Array.isArray(tasks)
    ? tasks.filter((task) => !task.parentId && !task.isCompleted)
    : [];

  // TYPE MATCH FIX: Stringify both sides of the comparison to reconcile Database Ints with HTML Strings
  const selectedTaskDetails = Array.isArray(tasks)
    ? tasks.find((t) => String(t.id) === String(linkedTaskId))
    : null;

  return (
    <div className="timer-container">
      <h2 style={{ marginBottom: "0.5rem" }}>⏱️ Focus Countdown</h2>
      <p
        style={{
          color: currentMode === "focus" ? "#646cff" : "#4caf50",
          textTransform: "uppercase",
          fontWeight: "bold",
          letterSpacing: "1.5px",
          fontSize: "0.9rem",
          margin: 0,
        }}
      >
        {currentMode === "focus"
          ? "🎯 Focus Session Active"
          : "☕ Take A Break"}
      </p>

      {/* Main Digital Clock Display Face */}
      <div className={`timer-face ${currentMode === "focus" ? "" : "break"}`}>
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
        {!isRunning ? (
          <button
            onClick={timer?.start}
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
            onClick={timer?.pause}
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
          onClick={timer?.reset}
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

      {/* Focus-on-Task Dropdown Linking Panel */}
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
          value={linkedTaskId || ""}
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

        {isRunning && selectedTaskDetails && (
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
