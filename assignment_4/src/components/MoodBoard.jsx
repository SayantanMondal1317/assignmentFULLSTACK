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

    // Direct match for Base64 data images
    if (cleanStr.startsWith("data:image")) {
      return "image";
    }

    // Check if it looks like a web link
    if (cleanStr.startsWith("http://") || cleanStr.startsWith("https://")) {
      // FIX: Strip query parameters (?...) and hashes (#...) to isolate the file extension
      const urlPathOnly = cleanStr.split(/[?#]/)[0];

      if (
        urlPathOnly.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
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

  // Safely checks if the text field contains a full 7-character hex for the visual picker preview
  const isExactHex = /^#([A-Fa-f0-9]{6})$/.test(inputValue.trim());

  return (
    <div>
      <h2 style={{ margin: "0 0 0.5rem 0" }}>🎨 Inspiration Mood Board</h2>
      <p style={{ color: "#888", margin: "0 0 2rem 0", fontSize: "0.9rem" }}>
        Choose a color visually using the swatch, paste a hex code (e.g.,{" "}
        <code>#ffb703</code>), drop an image URL, or just type a regular note to
        pin it.
      </p>

      {/* Insertion Input Row Form */}
      <form
        onSubmit={handleAddItem}
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "2.5rem",
          alignItems: "center",
        }}
      >
        {/* Visual Color Picker Swatch Anchor */}
        <div
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <input
            type="color"
            value={isExactHex ? inputValue.trim() : "#646cff"}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              position: "absolute",
              opacity: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
              zIndex: 2,
            }}
          />
          {/* Aesthetic minimal preview ring matching the Ryoku design language */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "4px",
              background: isExactHex
                ? inputValue.trim()
                : "linear-gradient(45deg, #f43f5e, #eab308, #06b6d4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              transition: "transform 0.2s ease",
            }}
            title="Open color palette"
          />
        </div>

        <input
          type="text"
          placeholder="Use the left swatch, paste hex code, image link, or type a reflection..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary">
          Pin Card
        </button>
      </form>

      {/* Freeform Responsive CSS Grid Engine Container */}
      <div className="mood-grid">
        {moodItems.map((item) => (
          <div
            key={item.id}
            className="mood-card"
            style={{
              background: item.type === "color" ? item.value : undefined,
              padding: item.type === "text" ? "1.25rem" : "0",
            }}
          >
            {/* Delete button floating overlay corner handler */}
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="delete-overlay-btn"
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
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.style.padding = "1rem";

                  // Clean out old error blocks if they exist to prevent duplication
                  const oldMsg =
                    e.target.parentNode.querySelector(".img-error-msg");
                  if (oldMsg) oldMsg.remove();

                  const msg = document.createElement("p");
                  msg.className = "img-error-msg";
                  msg.innerText = "⚠️ Image URL blocked or invalid";
                  msg.style.fontSize = "0.8rem";
                  msg.style.color = "#888";
                  msg.style.margin = "0";
                  msg.style.textAlign = "center";
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
