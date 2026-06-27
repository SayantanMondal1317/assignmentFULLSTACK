import React, { useState } from "react";

export default function TaskBoard({ tasks, setTasks }) {
  const [newTitle, setNewTitle] = useState("");

  // UI Management States
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [subtaskInputs, setSubtaskInputs] = useState({});
  const [activeDateDropdownId, setActiveDateDropdownId] = useState(null);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  // Advanced Animation State Tracks
  const [strikethroughIds, setStrikethroughIds] = useState(new Set());
  const [fadingIds, setFadingIds] = useState(new Set());

  // Helper: Generate structured absolute ISO date strings relative to today
  const getDatePresetString = (presetType) => {
    const today = new Date();
    if (presetType === "today") {
      return today.toLocaleDateString("en-CA");
    }
    if (presetType === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toLocaleDateString("en-CA");
    }
    if (presetType === "this-week") {
      const currentDay = today.getDay();
      const distanceToSunday = 7 - currentDay;
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + distanceToSunday);
      return endOfWeek.toLocaleDateString("en-CA");
    }
    return null;
  };

  // 1. Quick Add Top-Level Task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: newTitle.trim(),
      deadline: null,
      isCompleted: false,
      parentId: null,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle("");
  };

  // 2. Add Flat Subtask (Kept 100% relational via parentId, zero nesting)
  const handleAddSubtask = (e, parentId) => {
    e.preventDefault();
    const subtaskText = subtaskInputs[parentId] || "";
    if (!subtaskText.trim()) return;

    const newSubtask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: subtaskText.trim(),
      deadline: null,
      isCompleted: false,
      parentId: parentId,
    };

    setTasks((prev) => [...prev, newSubtask]);
    setSubtaskInputs((prev) => ({ ...prev, [parentId]: "" }));
  };

  // 3. Sequenced Animation Completion Controller
  const handleToggleComplete = (id, isSubtask = false, parentId = null) => {
    setStrikethroughIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    setTimeout(() => {
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      setTimeout(() => {
        setTasks((prevTasks) => {
          if (!isSubtask) {
            const currentParent = prevTasks.find((t) => t.id === id);
            const nextTargetState = !currentParent.isCompleted;

            return prevTasks.map((task) => {
              if (task.id === id)
                return { ...task, isCompleted: nextTargetState };
              if (task.parentId === id)
                return { ...task, isCompleted: nextTargetState };
              return task;
            });
          } else {
            const updatedTasks = prevTasks.map((task) =>
              task.id === id
                ? { ...task, isCompleted: !task.isCompleted }
                : task,
            );

            const siblings = updatedTasks.filter(
              (t) => t.parentId === parentId,
            );
            const allSiblingsDone = siblings.every((s) => s.isCompleted);

            return updatedTasks.map((task) => {
              if (task.id === parentId) {
                return { ...task, isCompleted: allSiblingsDone };
              }
              return task;
            });
          }
        });

        setStrikethroughIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setFadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 400);
    }, 400);
  };

  // 4. Update Deadlines via Preset Router
  const handleApplyDeadlinePreset = (id, presetType, customValue = null) => {
    const targetDate = customValue || getDatePresetString(presetType);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, deadline: targetDate } : task,
      ),
    );
    setActiveDateDropdownId(null);
  };

  // 5. Clear All Archive Records Entirely
  const handleClearArchive = () => {
    if (
      window.confirm(
        "Are you sure you want to permanently clear all completed archived tasks?",
      )
    ) {
      setTasks((prev) => prev.filter((task) => !task.isCompleted));
    }
  };

  // Inline Controls
  const startEditing = (id, currentTitle) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveInlineEdit = (id) => {
    if (!editingTitle.trim()) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, title: editingTitle.trim() } : task,
      ),
    );
    setEditingId(null);
  };

  const handleDeleteTask = (id, isSubtask = false) => {
    setTasks((prev) => {
      if (isSubtask) return prev.filter((task) => task.id !== id);
      return prev.filter((task) => task.id !== id && task.parentId !== id);
    });
  };

  // Derived Sorting Data Engine
  const groupTasks = (taskList) => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const groups = { overdue: [], today: [], upcoming: [], noDate: [] };

    taskList.forEach((task) => {
      if (task.parentId || task.isCompleted) return;

      if (!task.deadline) {
        groups.noDate.push(task);
      } else if (task.deadline < todayStr) {
        groups.overdue.push(task);
      } else if (task.deadline === todayStr) {
        groups.today.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    return groups;
  };

  const { overdue, today, upcoming, noDate } = groupTasks(tasks);
  const completedTasksList = tasks.filter(
    (task) => !task.parentId && task.isCompleted,
  );

  // Sub-Component Dropdown Preset Component
  const renderDatePickerMenu = (task) => {
    const isOpen = activeDateDropdownId === task.id;
    return (
      <div className="date-picker-wrapper">
        <button
          type="button"
          className="date-pill-trigger"
          onClick={() => setActiveDateDropdownId(isOpen ? null : task.id)}
        >
          📅 {task.deadline ? task.deadline : "Set Deadline"}
        </button>

        {isOpen && (
          <div className="date-presets-dropdown">
            <button
              type="button"
              className="preset-option"
              onClick={() => handleApplyDeadlinePreset(task.id, "today")}
            >
              ☀️ Today
            </button>
            <button
              type="button"
              className="preset-option"
              onClick={() => handleApplyDeadlinePreset(task.id, "tomorrow")}
            >
              🌅 Tomorrow
            </button>
            <button
              type="button"
              className="preset-option"
              onClick={() => handleApplyDeadlinePreset(task.id, "this-week")}
            >
              📅 This Week
            </button>
            <hr
              style={{
                border: "0",
                borderTop: "1px solid #333",
                margin: "2px 0",
              }}
            />
            <input
              type="date"
              className="custom-date-field"
              value={task.deadline || ""}
              onChange={(e) =>
                handleApplyDeadlinePreset(task.id, "custom", e.target.value)
              }
            />
          </div>
        )}
      </div>
    );
  };

  // Card Grid Row Component
  const renderTaskCard = (parentTask) => {
    const isStruck = strikethroughIds.has(parentTask.id);
    const isFading = fadingIds.has(parentTask.id);

    const subtasks = tasks.filter((t) => t.parentId === parentTask.id);
    const completedSubtasksCount = subtasks.filter((t) => t.isCompleted).length;
    const hasSubtasks = subtasks.length > 0;

    let cardClasses = "task-card";
    if (isStruck) cardClasses += " is-strikethrough";
    if (isFading) cardClasses += " is-fading";

    return (
      <li key={parentTask.id} className={cardClasses}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={parentTask.isCompleted}
            onChange={() => handleToggleComplete(parentTask.id, false)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />

          {editingId === parentTask.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveInlineEdit(parentTask.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && saveInlineEdit(parentTask.id)
              }
              autoFocus
              style={{
                flex: 1,
                background: "#333",
                border: "1px solid #646cff",
                color: "#fff",
                padding: "0.2rem",
                borderRadius: "4px",
              }}
            />
          ) : (
            <span
              onClick={() => startEditing(parentTask.id, parentTask.title)}
              style={{
                flex: 1,
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: "500",
              }}
            >
              {parentTask.title}
              {hasSubtasks && (
                <span className="badge-pill">
                  {completedSubtasksCount}/{subtasks.length} Done
                </span>
              )}
            </span>
          )}

          <button
            onClick={() => handleDeleteTask(parentTask.id, false)}
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

        <div
          style={{
            paddingLeft: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {renderDatePickerMenu(parentTask)}

          {hasSubtasks && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0.25rem 0 0 0",
                borderLeft: "1px dashed #444",
                paddingLeft: "0.75rem",
              }}
            >
              {subtasks.map((sub) => {
                const subStruck =
                  strikethroughIds.has(sub.id) || sub.isCompleted;
                return (
                  <li
                    key={sub.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      margin: "0.35rem 0",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={() =>
                        handleToggleComplete(sub.id, true, parentTask.id)
                      }
                      style={{
                        width: "14px",
                        height: "14px",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: subStruck ? "#666" : "#ddd",
                        textDecoration: subStruck ? "line-through" : "none",
                        flex: 1,
                      }}
                    >
                      {sub.title}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(sub.id, true)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#aa3333",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            onSubmit={(e) => handleAddSubtask(e, parentTask.id)}
            style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}
          >
            <input
              type="text"
              placeholder="+ Add a subtask..."
              value={subtaskInputs[parentTask.id] || ""}
              onChange={(e) =>
                setSubtaskInputs({
                  ...subtaskInputs,
                  [parentTask.id]: e.target.value,
                })
              }
              style={{
                flex: 1,
                background: "#111",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "0.8rem",
                padding: "0.2rem 0.5rem",
              }}
            />
          </form>
        </div>
      </li>
    );
  };

  const renderColumnList = (title, itemsList, titleColor = "#ffffff") => (
    <div className="board-column">
      <h3
        style={{
          margin: "0 0 1rem 0",
          color: titleColor,
          borderBottom: "1px solid #2a2a2a",
          paddingBottom: "0.5rem",
          fontSize: "1rem",
        }}
      >
        {title} ({itemsList.length})
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {itemsList.map((task) => renderTaskCard(task))}
        {itemsList.length === 0 && (
          <p
            style={{ color: "#555", fontSize: "0.85rem", fontStyle: "italic" }}
          >
            No tasks
          </p>
        )}
      </ul>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 1.5rem 0" }}>📋 Task Board</h2>

      <form
        onSubmit={handleAddTask}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
      >
        <input
          type="text"
          placeholder="Quick add a new main task (Press Enter)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary">
          Add Task
        </button>
      </form>

      <div className="board-grid">
        {renderColumnList("⚠️ Overdue", overdue, "#ff4a4a")}
        {renderColumnList("☀️ Today", today, "#ffb703")}
        {renderColumnList("📅 Upcoming", upcoming, "#2196f3")}
        {renderColumnList("⚪ No Date", noDate, "#aaa")}
      </div>

      {/* COMPONENT DRAWER: Collapsed Completed Section */}
      <div
        style={{
          marginTop: "3rem",
          borderTop: "1px solid #2a2a2a",
          paddingTop: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              color: "#aaa",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isCompletedCollapsed ? "▶ Show" : "▼ Hide"} Completed Archive (
            {completedTasksList.length})
          </button>

          {completedTasksList.length > 0 && (
            <button
              onClick={handleClearArchive}
              style={{
                background: "transparent",
                border: "1px solid #ff4a4a",
                color: "#ff4a4a",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 74, 74, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              🗑️ Clear Archive
            </button>
          )}
        </div>

        {!isCompletedCollapsed && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxWidth: "600px",
            }}
          >
            {completedTasksList.map((task) => (
              <li
                key={task.id}
                style={{
                  background: "#161616",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderLeft: "4px solid #4caf50",
                }}
              >
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "#555",
                    flex: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id, false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ff4a4a",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </li>
            ))}
            {completedTasksList.length === 0 && (
              <p
                style={{
                  color: "#444",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                }}
              >
                No archived history found.
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
