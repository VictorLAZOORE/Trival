"use client";

const BASE = "/api/rooms";

export async function createRoom(
  playerName: string
): Promise<{ code: string; playerId: string }> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create room");
  return data;
}

export async function joinRoom(
  code: string,
  playerName: string
): Promise<{ code: string; playerId: string }> {
  const res = await fetch(`${BASE}/${code.toUpperCase()}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to join room");
  return data;
}

export async function pollGameState(code: string, playerId: string) {
  const res = await fetch(`${BASE}/${code}?playerId=${playerId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get state");
  return data;
}

export async function performAction(
  code: string,
  playerId: string,
  action: string,
  extra?: Record<string, unknown>
) {
  const res = await fetch(`${BASE}/${code}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, action, ...extra }),
  });
  return res.json();
}
