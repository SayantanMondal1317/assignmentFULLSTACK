import React, { useState } from "react";

export default function TaskBoard({ token, tasks, fetchTasks }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState({});

  const isTaskComplete = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return task.completed;
    return task.subtasks.every((sub) => sub.completed);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: taskTitle }),
    });
    if (res.ok) {
      setTaskTitle("");
      fetchTasks();
    }
  };

  const handleAddSubtask = async (taskId) => {
    const title = subtaskTitle[taskId];
    if (!title || !title.trim()) return;
    const res = await fetch(
      `http://localhost:5000/api/tasks/${taskId}/subtasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      },
    );
    if (res.ok) {
      setSubtaskTitle({ ...subtaskTitle, [taskId]: "" });
      fetchTasks();
    }
  };

  const toggleSubtask = async (taskId, subtaskId, currentCompleted) => {
    const res = await fetch(
      `http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentCompleted }),
      },
    );
    if (res.ok) fetchTasks();
  };

  const handleToggleParentTask = async (task) => {
    const targetStatus = !isTaskComplete(task);
    const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: targetStatus }),
    });
    if (res.ok) fetchTasks();
  };

  const handleSetDeadline = async (taskId, rangeOption) => {
    let targetDate = "";
    const today = new Date();
    if (rangeOption === "today") {
      targetDate = today.toISOString().split("T")[0];
    } else if (rangeOption === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      targetDate = tomorrow.toISOString().split("T")[0];
    } else if (rangeOption === "week") {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      targetDate = nextWeek.toISOString().split("T")[0];
    }
    const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dueDate: targetDate }),
    });
    if (res.ok) fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchTasks();
  };

  const handleDeleteSubtask = async (taskId, subtaskId) => {
    const res = await fetch(
      `http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) fetchTasks();
  };

  const getGroup = (task) => {
    if (isTaskComplete(task)) return "Completed";
    if (!task.dueDate) return "No Date";
    const todayStr = new Date().toISOString().split("T")[0];
    if (task.dueDate < todayStr) return "Overdue";
    if (task.dueDate === todayStr) return "Today";
    return "Upcoming";
  };

  const groups = {
    Overdue: [],
    Today: [],
    Upcoming: [],
    "No Date": [],
    Completed: [],
  };
  tasks.forEach((t) => groups[getGroup(t)].push(t));

  return (
    <div>
      <h2>Task Management Board</h2>
      <form
        onSubmit={handleAddTask}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
      >
        <input
          type="text"
          placeholder="Add a fast summary action item..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
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
          Quick Add
        </button>
      </form>

      {Object.entries(groups).map(([groupName, groupList]) => (
        <div key={groupName} style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              borderBottom: "2px solid #dee2e6",
              paddingBottom: "0.3rem",
              color: "#495057",
            }}
          >
            {groupName} ({groupList.length})
          </h3>
          {groupList.map((task) => {
            const completedSubs = task.subtasks
              ? task.subtasks.filter((sub) => sub.completed).length
              : 0;
            const totalSubs = task.subtasks ? task.subtasks.length : 0;
            const completedOverall = isTaskComplete(task);

            return (
              <div
                key={task.id}
                style={{
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={completedOverall}
                      onChange={() => handleToggleParentTask(task)}
                      style={{ transform: "scale(1.2)", cursor: "pointer" }}
                    />
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={async () => {
                          await fetch(
                            `http://localhost:5000/api/tasks/${task.id}`,
                            {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ title: editingText }),
                            },
                          );
                          setEditingTaskId(null);
                          fetchTasks();
                        }}
                        autoFocus
                        style={{ padding: "0.2rem", flex: 1 }}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingText(task.title);
                        }}
                        style={{
                          cursor: "pointer",
                          flex: 1,
                          textDecoration: completedOverall
                            ? "line-through"
                            : "none",
                          color: completedOverall ? "#868e96" : "inherit",
                        }}
                      >
                        {task.title}
                      </span>
                    )}
                    {totalSubs > 0 && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          background: "#e9ecef",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "10px",
                        }}
                      >
                        {completedSubs}/{totalSubs} Subtasks
                      </span>
                    )}
                    <span style={{ fontSize: "0.8rem", color: "#666" }}>
                      {task.dueDate ? `📅 ${task.dueDate}` : "No deadline"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.25rem",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => handleSetDeadline(task.id, "today")}
                      style={{ fontSize: "0.75rem", padding: "0.25rem" }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleSetDeadline(task.id, "tomorrow")}
                      style={{ fontSize: "0.75rem", padding: "0.25rem" }}
                    >
                      Tomorrow
                    </button>
                    <button
                      onClick={() => handleSetDeadline(task.id, "week")}
                      style={{ fontSize: "0.75rem", padding: "0.25rem" }}
                    >
                      +7 Days
                    </button>
                    <input
                      type="date"
                      value={task.dueDate || ""}
                      onChange={async (e) => {
                        await fetch(
                          `http://localhost:5000/api/tasks/${task.id}`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ dueDate: e.target.value }),
                          },
                        );
                        fetchTasks();
                      }}
                      style={{ fontSize: "0.75rem", width: "110px" }}
                    />
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#fa5252",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: "2rem",
                    marginTop: "0.5rem",
                    borderLeft: "2px solid #e9ecef",
                    paddingLeft: "0.5rem",
                  }}
                >
                  {task.subtasks &&
                    task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() =>
                            toggleSubtask(task.id, sub.id, sub.completed)
                          }
                        />
                        <span
                          style={{
                            fontSize: "0.9rem",
                            textDecoration: sub.completed
                              ? "line-through"
                              : "none",
                            color: sub.completed ? "#868e96" : "inherit",
                          }}
                        >
                          {sub.title}
                        </span>
                        <button
                          onClick={() => handleDeleteSubtask(task.id, sub.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fa5252",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.25rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="New subtask..."
                      value={subtaskTitle[task.id] || ""}
                      onChange={(e) =>
                        setSubtaskTitle({
                          ...subtaskTitle,
                          [task.id]: e.target.value,
                        })
                      }
                      style={{ fontSize: "0.8rem", padding: "0.2rem" }}
                    />
                    <button
                      onClick={() => handleAddSubtask(task.id)}
                      style={{ fontSize: "0.8rem", padding: "0.2rem" }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
