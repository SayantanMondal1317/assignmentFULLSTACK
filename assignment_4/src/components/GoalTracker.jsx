import React, { useState } from "react";

export default function GoalTracker({ goals, setGoals }) {
  const [title, setTitle] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // UI States for inline title renaming
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // 1. Create a New Goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title.trim() || !targetNumber || Number(targetNumber) <= 0) return;

    const newGoal = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: title.trim(),
      targetNumber: Math.floor(Number(targetNumber)),
      currentNumber: 0,
      targetDate: targetDate || null,
    };

    setGoals((prev) => [...prev, newGoal]);
    setTitle("");
    setTargetNumber("");
    setTargetDate("");
  };

  // 2. Clamped Increments (+1)
  const handleIncrement = (id) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id && goal.currentNumber < goal.targetNumber) {
          return { ...goal, currentNumber: goal.currentNumber + 1 };
        }
        return goal;
      }),
    );
  };

  // 3. Clamped Decrements (-1)
  const handleDecrement = (id) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id && goal.currentNumber > 0) {
          return { ...goal, currentNumber: goal.currentNumber - 1 };
        }
        return goal;
      }),
    );
  };

  // 4. Inline Save Title
  const saveInlineEdit = (id) => {
    if (!editingTitle.trim()) return;
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, title: editingTitle.trim() } : goal,
      ),
    );
    setEditingId(null);
  };

  // 5. Delete Goal
  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 1.5rem 0" }}>🎯 Goal Tracker</h2>

      {/* Goal Creator Form Layout */}
      <form
        onSubmit={handleAddGoal}
        style={{
          background: "#1a1a1a",
          padding: "1.25rem",
          borderRadius: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "flex-end",
          marginBottom: "2rem",
          border: "1px solid #333",
        }}
      >
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
            style={{
              padding: "0.6rem",
              background: "#111",
              border: "1px solid #444",
              borderRadius: "4px",
              color: "#fff",
            }}
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
            Target Count
          </label>
          <input
            type="number"
            min="1"
            placeholder="12"
            value={targetNumber}
            onChange={(e) => setTargetNumber(e.target.value)}
            style={{
              padding: "0.6rem",
              background: "#111",
              border: "1px solid #444",
              borderRadius: "4px",
              color: "#fff",
            }}
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
              border: "1px solid #444",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.65rem 1.5rem",
            background: "#646cff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Create Goal
        </button>
      </form>

      {/* Render Active Goals List */}
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
              style={{
                background: "#1a1a1a",
                padding: "1.25rem",
                borderRadius: "8px",
                borderLeft: `4px solid ${isFinished ? "#4caf50" : "#646cff"}`,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              {/* Top Row: Title and Metrics */}
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
                      fontSize: "1.1rem",
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
                      fontSize: "1.1rem",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Bottom Row: Controls and Progress Fill Wrapper */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                {/* Decrement Counter */}
                <button
                  onClick={() => handleDecrement(goal.id)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    background: "#2d2d2d",
                    color: "#fff",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  -
                </button>

                {/* Progress Bar Track */}
                <div
                  style={{
                    flex: 1,
                    height: "12px",
                    background: "#111",
                    borderRadius: "6px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: isFinished
                        ? "linear-gradient(90deg, #4caf50, #81c784)"
                        : "linear-gradient(90deg, #646cff, #9097ff)",
                      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>

                {/* Increment Counter */}
                <button
                  onClick={() => handleIncrement(goal.id)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    background: "#2d2d2d",
                    color: "#fff",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
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
