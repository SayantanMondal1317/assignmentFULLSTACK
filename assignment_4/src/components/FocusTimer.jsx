import React, { useState } from "react";
import { useTimer } from "../hooks/useTimer";

export default function FocusTimer({ tasks }) {
  const { secondsRemaining, isRunning, start, pause, reset } = useTimer(1500);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const remainingSecs = (secs % 60).toString().padStart(2, "0");
    return `${mins}:${remainingSecs}`;
  };

  const activeTask = tasks.find((t) => t.id === selectedTaskId);
  const incompleteTasks = tasks.filter((t) => !t.completed);

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "2rem auto",
        textAlign: "center",
        background: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", color: "#495057" }}>
        Focus Countdown
      </h2>

      <div
        style={{
          fontSize: "4.5rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          margin: "1rem 0",
          color: "#212529",
        }}
      >
        {formatTime(secondsRemaining)}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "100%",
            borderRadius: "4px",
            border: "1px solid #ced4da",
          }}
        >
          <option value="">Associate an incomplete task</option>
          {incompleteTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {activeTask && (
        <div
          style={{
            background: "#e3fafc",
            color: "#0b7285",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Focusing on: {activeTask.title}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        {!isRunning ? (
          <button
            onClick={start}
            style={{
              padding: "0.6rem 1.5rem",
              background: "#40c057",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            style={{
              padding: "0.6rem 1.5rem",
              background: "#fab005",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Pause
          </button>
        )}
        <button
          onClick={() => reset(1500)}
          style={{
            padding: "0.6rem 1.5rem",
            background: "#868e96",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
