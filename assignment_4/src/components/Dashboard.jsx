import React from "react";

export default function Dashboard({ tasks, goals }) {
  // Get today's local date string for filtering priorities
  const todayStr = new Date().toLocaleDateString("en-CA");

  // 1. Calculate Task Statistics
  const totalCompletedTasks = tasks.filter((task) => task.isCompleted).length;

  // Filter for today's incomplete top-level priorities
  const todaysPriorities = tasks.filter(
    (task) => !task.parentId && !task.isCompleted && task.deadline === todayStr,
  );

  // 2. Calculate Global Macro-Goal Progress Average
  const totalGoalsCount = goals.length;
  const globalGoalPercentage = (() => {
    if (totalGoalsCount === 0) return 0;

    const totalPercentageSum = goals.reduce((sum, goal) => {
      const goalPercent = (goal.currentNumber / goal.targetNumber) * 100;
      return sum + Math.min(goalPercent, 100);
    }, 0);

    return Math.round(totalPercentageSum / totalGoalsCount);
  })();

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 0.25rem 0" }}>📊 Executive Dashboard</h2>
      <p style={{ color: "#888", margin: "0 0 2rem 0", fontSize: "0.9rem" }}>
        Real-time metrics compiled straight from your persistent local workspace
        data arrays.
      </p>

      {/* Grid Layout for Top Metric Cards */}
      <div className="metric-grid">
        {/* Metric Card 1: Completed Tasks */}
        <div className="metric-card">
          <span style={{ fontSize: "2rem" }}>🏆</span>
          <h4
            style={{
              margin: "0.5rem 0 0.25rem 0",
              color: "#aaa",
              fontWeight: "500",
            }}
          >
            Tasks Cleared
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "2.25rem",
              fontWeight: "800",
              color: "#4caf50",
            }}
          >
            {totalCompletedTasks}{" "}
            <span
              style={{ fontSize: "1rem", color: "#555", fontWeight: "400" }}
            >
              total items
            </span>
          </p>
        </div>

        {/* Metric Card 2: Aggregated Macro Goals Progress */}
        <div className="metric-card">
          <span style={{ fontSize: "2rem" }}>📈</span>
          <h4
            style={{
              margin: "0.5rem 0 0.5rem 0",
              color: "#aaa",
              fontWeight: "500",
            }}
          >
            Global Goal Alignment
          </h4>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.4rem",
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: "#646cff",
              }}
            >
              {globalGoalPercentage}%
            </span>
            <span style={{ fontSize: "0.8rem", color: "#666" }}>
              Across {totalGoalsCount} targets
            </span>
          </div>

          {/* Master Progress Bar Track */}
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#111",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${globalGoalPercentage}%`,
                height: "100%",
                background: "linear-gradient(90deg, #646cff, #9097ff)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Focus Window for Today's High Priorities */}
      <div className="priority-panel">
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>🔥</span> Today's Immediate Priorities (
          {todaysPriorities.length})
        </h3>

        {todaysPriorities.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {todaysPriorities.map((task) => (
              <li key={task.id} className="priority-item">
                <span>{task.title}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#ffb703",
                    background: "rgba(255,183,3,0.1)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Due Today
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              color: "#555",
              fontStyle: "italic",
              margin: "0",
              fontSize: "0.95rem",
            }}
          >
            No high priority tasks scheduled for today. You are completely
            caught up!
          </p>
        )}
      </div>
    </div>
  );
}
