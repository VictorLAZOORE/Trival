"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GameStateResponse } from "@/types/game";
import { pollGameState } from "@/lib/api";

export function useGamePolling(
  code: string,
  playerId: string
): {
  state: GameStateResponse | null;
  error: string | null;
  refresh: () => void;
} {
  const [state, setState] = useState<GameStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevStatusRef = useRef<string>("");

  const poll = useCallback(async () => {
    if (!code || !playerId) return;
    try {
      const data = await pollGameState(code, playerId);
      setState(data);
      prevStatusRef.current = data.room?.status || "";
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection lost");
    }
  }, [code, playerId]);

  useEffect(() => {
    if (!code || !playerId) return;

    poll();
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, [code, playerId, poll]);

  return { state, error, refresh: poll };
}
