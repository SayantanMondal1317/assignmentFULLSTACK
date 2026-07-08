import React, { useState } from "react";

export default function TaskBoard({ tasks, setTasks, subtasks, setSubtasks }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState({});

  const isTaskComplete = (task) => {
    const parentSubtasks = subtasks.filter((sub) => sub.parentId === task.id);
    if (parentSubtasks.length === 0) return task.completed;
    return parentSubtasks.every((sub) => sub.completed);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      title: taskTitle,
      dueDate: "",
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setTaskTitle("");
  };

  const handleAddSubtask = (taskId) => {
    const title = subtaskTitle[taskId];
    if (!title || !title.trim()) return;
    const newSub = {
      id: crypto.randomUUID(),
      parentId: taskId,
      title: title,
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setSubtaskTitle({ ...subtaskTitle, [taskId]: "" });

    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: false } : t)),
    );
  };

  const toggleSubtask = (subtaskId, parentId) => {
    const updatedSubs = subtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub,
    );
    setSubtasks(updatedSubs);

    const siblingSubs = updatedSubs.filter((sub) => sub.parentId === parentId);
    const allDone = siblingSubs.every((sub) => sub.completed);
    setTasks(
      tasks.map((t) => (t.id === parentId ? { ...t, completed: allDone } : t)),
    );
  };

  const handleToggleParentTask = (task) => {
    const parentSubtasks = subtasks.filter((sub) => sub.parentId === task.id);
    const targetStatus = !isTaskComplete(task);

    if (parentSubtasks.length > 0) {
      setSubtasks(
        subtasks.map((sub) =>
          sub.parentId === task.id ? { ...sub, completed: targetStatus } : sub,
        ),
      );
    }
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, completed: targetStatus } : t,
      ),
    );
  };

  const handleSetDeadline = (taskId, rangeOption) => {
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

    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, dueDate: targetDate } : t)),
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setSubtasks(subtasks.filter((sub) => sub.parentId !== taskId));
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
      <h2 style={{ marginBottom: "1.5rem" }}>Task Management Board</h2>

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
            const parentSubtasks = subtasks.filter(
              (sub) => sub.parentId === task.id,
            );
            const completedSubs = parentSubtasks.filter(
              (sub) => sub.completed,
            ).length;
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
                        onBlur={() => {
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? { ...t, title: editingText }
                                : t,
                            ),
                          );
                          setEditingTaskId(null);
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

                    {parentSubtasks.length > 0 && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          background: "#e9ecef",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "10px",
                        }}
                      >
                        {completedSubs}/{parentSubtasks.length} Subtasks
                      </span>
                    )}

                    <span style={{ fontSize: "0.8rem", color: "#666" }}>
                      {task.dueDate ? `Due: ${task.dueDate}` : "No deadline"}
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
                      value={task.dueDate}
                      onChange={(e) =>
                        setTasks(
                          tasks.map((t) =>
                            t.id === task.id
                              ? { ...t, dueDate: e.target.value }
                              : t,
                          ),
                        )
                      }
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
                  {parentSubtasks.map((sub) => (
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
                        onChange={() => toggleSubtask(sub.id, task.id)}
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
                        onClick={() =>
                          setSubtasks(subtasks.filter((s) => s.id !== sub.id))
                        }
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
