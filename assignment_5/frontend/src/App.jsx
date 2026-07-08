import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import TaskBoard from "./components/TaskBoard";
import GoalTracker from "./components/GoalTracker";
import FocusTimer from "./components/FocusTimer";
import MoodBoard from "./components/MoodBoard";

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("cipher_token") || "",
  );
  const [activeSection, setActiveSection] = useState("tasks");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [moodItems, setMoodItems] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("cipher_token", token);
      fetchTasks();
      fetchGoals();
      fetchMoodItems();
    } else {
      localStorage.removeItem("cipher_token");
    }
  }, [token]);

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  };

  const fetchGoals = async () => {
    const res = await fetch("http://localhost:5000/api/goals", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setGoals(data);
    }
  };

  const fetchMoodItems = async () => {
    const res = await fetch("http://localhost:5000/api/mood", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMoodItems(data);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "register" : "login";
    const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
    } else {
      alert(data.error);
    }
  };

  const handleLogout = () => {
    setToken("");
    setTasks([]);
    setGoals([]);
    setMoodItems([]);
  };

  if (!token) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "100px auto",
          padding: "2rem",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Cipher {isRegistering ? "Register" : "Login"}</h2>
        <form
          onSubmit={handleAuth}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "0.6rem" }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "0.6rem" }}
            required
          />
          <button
            type="submit"
            style={{
              padding: "0.6rem",
              background: "#228be6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isRegistering ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            background: "none",
            border: "none",
            color: "#228be6",
            marginTop: "1rem",
            cursor: "pointer",
          }}
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "tasks":
        return (
          <TaskBoard token={token} tasks={tasks} fetchTasks={fetchTasks} />
        );
      case "goals":
        return (
          <GoalTracker token={token} goals={goals} fetchGoals={fetchGoals} />
        );
      case "focus":
        return <FocusTimer tasks={tasks} />;
      case "mood":
        return (
          <MoodBoard
            token={token}
            moodItems={moodItems}
            fetchMoodItems={fetchMoodItems}
          />
        );
      default:
        return (
          <TaskBoard token={token} tasks={tasks} fetchTasks={fetchTasks} />
        );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        background: "#f8f9fa",
        color: "#212529",
      }}
    >
      <Dashboard
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogout={handleLogout}
      />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {renderContent()}
      </main>
    </div>
  );
}
