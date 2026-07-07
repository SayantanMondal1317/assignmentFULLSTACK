import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function GoalTracker() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await api.goals.getAll();
        setGoals(data);
      } catch (err) {
        console.error("Could not fetch goals:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGoals();
  }, []);

  const handleAddGoal = async (title, targetDate, initialProgress = 0) => {
    try {
      const savedGoal = await api.goals.create({
        title,
        targetDate,
        progress: initialProgress,
      });
      setGoals((prev) => [...prev, savedGoal]);
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  };

  const handleUpdateProgress = async (id, currentProgress, step) => {
    const nextProgress = Math.max(0, Math.min(100, currentProgress + step));
    try {
      const updated = await api.goals.update(id, { progress: nextProgress });
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      console.error("Failed to change goal value:", err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.goals.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to remove goal:", err);
    }
  };

  if (loading) return <div>Synchronizing Goals Tracker...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 1.5rem 0" }}>🎯 Goal Tracker</h2>

      <form onSubmit={handleAddGoal} className="goal-form">
        <div
          style={{
            flex: "2 1 200px",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <label style={{ fontSize: "0.85rem", color: "#aaa" }}>
            Goal Metric Title
          </label>
          <input
            type="text"
            placeholder="e.g., Read Books, Pushups, LeetCode..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div
          style={{
            flex: "1 1 100px",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <label style={{ fontSize: "0.85rem", color: "#aaa" }}>
            Target Count (1-100)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="12"
            value={targetNumber}
            onChange={(e) => setTargetNumber(e.target.value)}
          />
        </div>

        <div
          style={{
            flex: "1 1 130px",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <label style={{ fontSize: "0.85rem", color: "#aaa" }}>
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{
              padding: "0.55rem",
              background: "#111",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <button type="submit" className="btn-primary">
          Create Goal
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {goals.map((goal) => {
          const percent =
            Math.min(
              Math.round((goal.currentNumber / goal.targetNumber) * 100),
              100,
            ) || 0;
          const isFinished = goal.currentNumber === goal.targetNumber;

          return (
            <div
              key={goal.id}
              className={`goal-card ${isFinished ? "completed" : ""}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                {editingId === goal.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveInlineEdit(goal.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && saveInlineEdit(goal.id)
                    }
                    autoFocus
                    style={{
                      background: "#333",
                      border: "1px solid #646cff",
                      color: "#fff",
                      padding: "0.2rem",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <h3
                    onClick={() => {
                      setEditingId(goal.id);
                      setEditingTitle(goal.title);
                    }}
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      textDecoration: isFinished ? "line-through" : "none",
                      color: isFinished ? "#888" : "#fff",
                    }}
                  >
                    {goal.title}
                  </h3>
                )}

                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  {goal.targetDate && (
                    <span style={{ fontSize: "0.8rem", color: "#666" }}>
                      📅 By: {goal.targetDate}
                    </span>
                  )}
                  <span
                    style={{
                      fontWeight: "700",
                      color: isFinished ? "#4caf50" : "#fff",
                    }}
                  >
                    {goal.currentNumber} / {goal.targetNumber} ({percent}%)
                  </span>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ff4a4a",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <button
                  onClick={() => handleDecrement(goal.id)}
                  className="btn-counter"
                >
                  -
                </button>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <button
                  onClick={() => handleIncrement(goal.id)}
                  className="btn-counter"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <p
            style={{
              color: "#555",
              fontStyle: "italic",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            No macro-goals set yet. Set your first milestone targets above!
          </p>
        )}
      </div>
    </div>
  );
}
