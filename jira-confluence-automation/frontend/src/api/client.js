const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username, role) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, role }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function runSync(token) {
  const res = await fetch(`${BASE_URL}/sync`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Sync failed");
  return res.json();
}

export async function getStatusReport(token) {
  const res = await fetch(`${BASE_URL}/status-report`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load status report");
  return res.json();
}

export async function getAlerts(token) {
  const res = await fetch(`${BASE_URL}/alerts`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load alerts");
  return res.json();
}

export async function acknowledgeAlert(token, id) {
  const res = await fetch(`${BASE_URL}/alerts/${id}/acknowledge`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to acknowledge alert");
  return res.json();
}

export async function getActionItems(token) {
  const res = await fetch(`${BASE_URL}/action-items`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load action items");
  return res.json();
}

export async function completeActionItem(token, id) {
  const res = await fetch(`${BASE_URL}/action-items/${id}/complete`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to complete action item");
  return res.json();
}
