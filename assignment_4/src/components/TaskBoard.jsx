import React, { useState } from "react";

export default function TaskBoard({ tasks, setTasks }) {
  const [newTitle, setNewTitle] = useState("");

  // UI states for inline edits, subtask additions, and animations
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [subtaskInputs, setSubtaskInputs] = useState({}); // tracking input values per parent task
  const [fadingIds, setFadingIds] = useState(new Set());

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

  // 2. Add a Subtask referencing a parent
  const handleAddSubtask = (e, parentId) => {
    e.preventDefault();
    const subtaskText = subtaskInputs[parentId] || "";
    if (!subtaskText.trim()) return;

    const newSubtask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: subtaskText.trim(),
      deadline: null,
      isCompleted: false,
      parentId: parentId, // Linked to parent
    };

    setTasks((prev) => [...prev, newSubtask]);
    setSubtaskInputs((prev) => ({ ...prev, [parentId]: "" }));
  };

  // 3. Delayed Cascading Completion Trigger
  const handleToggleComplete = (id, isSubtask = false, parentId = null) => {
    // Add target to fading animation set
    setFadingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    setTimeout(() => {
      setTasks((prevTasks) => {
        if (!isSubtask) {
          // Case A: Toggling a Parent Task -> updates parent and cascades to all subtasks
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
          // Case B: Toggling a Subtask -> updates child, then recalculates parent
          const updatedTasks = prevTasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task,
          );

          // Find all sibling subtasks for this parent
          const siblings = updatedTasks.filter((t) => t.parentId === parentId);
          const allSiblingsDone = siblings.every((s) => s.isCompleted);

          // If all child subtasks are checked off, mark the parent complete too
          return updatedTasks.map((task) => {
            if (task.id === parentId) {
              return { ...task, isCompleted: allSiblingsDone };
            }
            return task;
          });
        }
      });

      // Clear fading animation state
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  };

  // 4. Inline Editing
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

  // 5. Update Deadlines
  const handleUpdateDeadline = (id, dateValue) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, deadline: dateValue || null } : task,
      ),
    );
  };

  // 6. Cascading Deletion
  const handleDeleteTask = (id, isSubtask = false) => {
    setTasks((prev) => {
      if (isSubtask) {
        return prev.filter((task) => task.id !== id);
      } else {
        // Delete parent AND all children matching parentId
        return prev.filter((task) => task.id !== id && task.parentId !== id);
      }
    });
  };

  // 7. Dynamic Grouping (Excludes subtasks and completed parent items)
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

  // Core Master Task Component Renderer
  const renderTaskCard = (parentTask) => {
    const isFading = fadingIds.has(parentTask.id);

    // Derived values for subtask progress tracking
    const subtasks = tasks.filter((t) => t.parentId === parentTask.id);
    const completedSubtasksCount = subtasks.filter((t) => t.isCompleted).length;
    const hasSubtasks = subtasks.length > 0;

    return (
      <li
        key={parentTask.id}
        style={{
          background: "#262626",
          padding: "0.85rem",
          borderRadius: "6px",
          marginBottom: "0.75rem",
          borderLeft: "4px solid #646cff",
          opacity: isFading ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
      >
        {/* Parent Main Flex Container */}
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
                <span
                  style={{
                    marginLeft: "0.5rem",
                    fontSize: "0.8rem",
                    color: "#646cff",
                    background: "#1a1a1a",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "10px",
                  }}
                >
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

        {/* Inline Properties & Subtask Section */}
        <div
          style={{
            paddingLeft: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {/* Deadline Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#888" }}>
              📅 Deadline:
            </span>
            <input
              type="date"
              value={parentTask.deadline || ""}
              onChange={(e) =>
                handleUpdateDeadline(parentTask.id, e.target.value)
              }
              style={{
                background: "#1a1a1a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "0.75rem",
                padding: "0.1rem",
              }}
            />
          </div>

          {/* Subtask List Render */}
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
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "0.35rem 0",
                    opacity: fadingIds.has(sub.id) ? 0 : 1,
                    transition: "opacity 400ms ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sub.isCompleted}
                    onChange={() =>
                      handleToggleComplete(sub.id, true, parentTask.id)
                    }
                    style={{ width: "14px", height: "14px", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: sub.isCompleted ? "#666" : "#ddd",
                      textDecoration: sub.isCompleted ? "line-through" : "none",
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
              ))}
            </ul>
          )}

          {/* Quick-add Subtask Form input field */}
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
    <div
      style={{
        flex: "1 1 230px",
        background: "#1a1a1a",
        padding: "1rem",
        borderRadius: "8px",
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem 0",
          color: titleColor,
          borderBottom: "1px solid #333",
          paddingBottom: "0.5rem",
        }}
      >
        {title} ({itemsList.length})
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {itemsList.map((task) => renderTaskCard(task))}
        {itemsList.length === 0 && (
          <p style={{ color: "#555", fontSize: "0.9rem", fontStyle: "italic" }}>
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
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#646cff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Add Task
        </button>
      </form>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {renderColumnList("⚠️ Overdue", overdue, "#ff4a4a")}
        {renderColumnList("☀️ Today", today, "#ffb703")}
        {renderColumnList("📅 Upcoming", upcoming, "#2196f3")}
        {renderColumnList("⚪ No Date", noDate, "#aaa")}
      </div>
    </div>
  );
}
