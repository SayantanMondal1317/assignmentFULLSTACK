import React, { useState } from "react";

export default function MoodBoard({ token, moodItems, fetchMoodItems }) {
  const [inputVal, setInputVal] = useState("");
  const samplePalette = [
    "#ff6b6b",
    "#4dabf7",
    "#51cf66",
    "#fcc419",
    "#cc5de8",
    "#ff922b",
    "#212529",
  ];

  const handleAddItem = async (val) => {
    const itemValue = val || inputVal;
    if (!itemValue.trim()) return;

    const isImage =
      itemValue.startsWith("http://") ||
      itemValue.startsWith("https://") ||
      itemValue.startsWith("data:image");
    const type = isImage ? "image" : "color";

    const res = await fetch("http://localhost:5000/api/mood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, value: itemValue }),
    });

    if (res.ok) {
      if (!val) setInputVal("");
      fetchMoodItems();
    }
  };

  const handleRemoveItem = async (id) => {
    const res = await fetch(`http://localhost:5000/api/mood/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchMoodItems();
    }
  };

  return (
    <div>
      <h2>Creative Workspace Mood Board</h2>
      <div
        style={{
          background: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}
        >
          <input
            type="text"
            placeholder="Paste raw Hex code (#ff6b6b) or asset image link URL..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "4px",
              border: "1px solid #ced4da",
            }}
          />
          <button
            onClick={() => handleAddItem()}
            style={{
              padding: "0.6rem 1.2rem",
              background: "#228be6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Insert Grid
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>Quick Palette:</span>
          {samplePalette.map((color) => (
            <button
              key={color}
              onClick={() => handleAddItem(color)}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: "1px solid #dee2e6",
                background: color,
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
        }}
      >
        {moodItems.map((item) => (
          <div
            key={item.id}
            style={{
              height: "150px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              background: item.type === "color" ? item.value : "#e9ecef",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {item.type === "image" ? (
              <img
                src={item.value}
                alt="Mood"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  color: "#fff",
                  mixBlendMode: "difference",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                }}
              >
                {item.value}
              </span>
            )}
            <button
              onClick={() => handleRemoveItem(item.id)}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "rgba(250,82,82,0.85)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              ✕ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
