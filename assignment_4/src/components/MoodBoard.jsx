import React, { useState } from "react";

export default function MoodBoard({ moodItems, setMoodItems }) {
  const [inputValue, setInputValue] = useState("");

  // 1. Intelligent parser to detect input type (Color Hex vs. Image Link vs. Text Note)
  const detectType = (str) => {
    const cleanStr = str.trim();

    // Check if it's a valid hex color code (e.g., #646cff or #fff)
    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    if (hexRegex.test(cleanStr)) {
      return "color";
    }

    // Check if it looks like an image URL or web link
    if (
      cleanStr.startsWith("http://") ||
      cleanStr.startsWith("https://") ||
      cleanStr.startsWith("data:image")
    ) {
      // Simple extension check or general external image assumption
      if (
        cleanStr.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
        cleanStr.includes("images.unsplash.com")
      ) {
        return "image";
      }
    }

    // Fallback to standard textual sticky note
    return "text";
  };

  // 2. Add Item to Grid
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const detectedType = detectType(inputValue);
    const newItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type: detectedType,
      value: inputValue.trim(),
    };

    setMoodItems((prev) => [...prev, newItem]);
    setInputValue("");
  };

  // 3. Remove Item from Grid
  const handleRemoveItem = (id) => {
    setMoodItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 0.5rem 0" }}>🎨 Inspiration Mood Board</h2>
      <p style={{ color: "#888", margin: "0 0 2rem 0", fontSize: "0.9rem" }}>
        Paste a color hex code (e.g., <code>#ffb703</code>), an image URL, or
        just type a regular note to pin it.
      </p>

      {/* Insertion Input Row Form */}
      <form
        onSubmit={handleAddItem}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem" }}
      >
        <input
          type="text"
          placeholder="Paste hex code, image link, or type a reflection..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
          Pin Card
        </button>
      </form>

      {/* Freeform Responsive CSS Grid Engine Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {moodItems.map((item) => (
          <div
            key={item.id}
            style={{
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              background: item.type === "color" ? item.value : "#1a1a1a",
              border: "1px solid #333",
              minHeight: "150px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: item.type === "text" ? "1.25rem" : "0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Delete button floating overlay corner handler */}
            <button
              onClick={() => handleRemoveItem(item.id)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(0, 0, 0, 0.65)",
                color: "#ff4a4a",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                zIndex: 2,
              }}
              title="Delete pin"
            >
              ✕
            </button>

            {/* Dynamic Card Internal Renderer Blocks */}
            {item.type === "color" && (
              <span
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                }}
              >
                {item.value.toUpperCase()}
              </span>
            )}

            {item.type === "image" && (
              <img
                src={item.value}
                alt="Inspiration grid pin"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  // Fallback if image link breaks or blocks hotlinking
                  e.target.style.display = "none";
                  e.target.parentNode.style.padding = "1rem";
                  const msg = document.createElement("p");
                  msg.innerText = "⚠️ Image URL blocked or invalid";
                  msg.style.fontSize = "0.8rem";
                  msg.style.color = "#888";
                  e.target.parentNode.appendChild(msg);
                }}
              />
            )}

            {item.type === "text" && (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  color: "#ddd",
                  lineHeight: "1.4",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}
              >
                {item.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {moodItems.length === 0 && (
        <p
          style={{
            color: "#555",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: "3rem",
          }}
        >
          Your mood board is a blank canvas. Start pinning color palettes,
          images, or reflections!
        </p>
      )}
    </div>
  );
}
