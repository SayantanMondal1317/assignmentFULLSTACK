const BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("cipher_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An API error occurred");
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request("/auth/me", { method: "GET" }),
  },
  tasks: {
    getAll: () => request("/tasks", { method: "GET" }),
    create: (data) =>
      request("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  },
  goals: {
    getAll: () => request("/goals", { method: "GET" }),
    create: (data) =>
      request("/goals", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`/goals/${id}`, { method: "DELETE" }),
  },
};
