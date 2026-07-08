import React from "react";

export default function Dashboard({ activeSection, setActiveSection }) {
  const menuItems = [
    { id: "tasks", label: "Task Board" },
    { id: "goals", label: "Goal Tracker" },
    { id: "focus", label: "Focus Timer" },
    { id: "mood", label: "Mood Board" },
  ];

  return (
    <aside
      style={{
        width: "240px",
        background: "#1e1e24",
        color: "#fff",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          margin: "0 0 2rem 0",
          fontSize: "1.5rem",
          letterSpacing: "1px",
          color: "#4dabf7",
        }}
      >
        Cipher MVP
      </h2>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              background: activeSection === item.id ? "#4dabf7" : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: activeSection === item.id ? "bold" : "normal",
              transition: "background 0.2s",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
