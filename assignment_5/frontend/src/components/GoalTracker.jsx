import React, { useState } from "react";

export default function GoalTracker({ token, goals, fetchGoals }) {
  const [goalTitle, setGoalTitle] = useState("");

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const res = await fetch("http://localhost:5000/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: goalTitle }),
    });
    if (res.ok) {
      setGoalTitle("");
      fetchGoals();
    }
  };

  const updateProgress = async (goal, delta) => {
    const nextProgress = Math.min(100, Math.max(0, goal.progress + delta));
    const res = await fetch(`http://localhost:5000/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ progress: nextProgress }),
    });
    if (res.ok) fetchGoals();
  };

  const handleDeleteGoal = async (id) => {
    const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchGoals();
  };

  return (
    <div>
      <h2>Metric Progress Goal Tracker</h2>
      <form
        onSubmit={handleAddGoal}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
      >
        <input
          type="text"
          placeholder="Identify target objective target..."
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          style={{
            flex: 1,
            padding: "0.6rem",
            borderRadius: "4px",
            border: "1px solid #ced4da",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.6rem 1.2rem",
            background: "#228be6",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Goal
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {goals.map((goal) => (
          <div
            key={goal.id}
            style={{
              background: "#fff",
              padding: "1.25rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <h4 style={{ margin: "0 0 0.75rem 0", color: "#343a40" }}>
              {goal.title}
            </h4>
            <div
              style={{
                background: "#e9ecef",
                borderRadius: "4px",
                height: "10px",
                overflow: "hidden",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: `${goal.progress}%`,
                  background: "#40c057",
                  height: "100%",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                {goal.progress}%
              </span>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  onClick={() => updateProgress(goal, -5)}
                  style={{ padding: "0.25rem 0.5rem" }}
                >
                  -5
                </button>
                <button
                  onClick={() => updateProgress(goal, 5)}
                  style={{ padding: "0.25rem 0.5rem" }}
                >
                  +5
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  style={{
                    background: "#fa5252",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
