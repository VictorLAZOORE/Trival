"use client";

import { useState } from "react";
import { GameStateResponse, THEMES } from "@/types/game";
import { performAction } from "@/lib/api";

interface LobbyProps {
  state: GameStateResponse;
  playerId: string;
  roomCode: string;
}

export default function Lobby({ state, playerId, roomCode }: LobbyProps) {
  const [theme, setTheme] = useState(state.room.theme || "");
  const [customTheme, setCustomTheme] = useState("");
  const [questionCount, setQuestionCount] = useState(
    state.room.questionCount || 5
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isHost = playerId === state.room.host;
  const selectedTheme = theme === "custom" ? customTheme : theme;
  const questionsReady = state.room.questionsReady;

  async function handleGenerateQuestions() {
    if (!selectedTheme) return;
    setLoading(true);
    setError("");

    try {
      await performAction(roomCode, playerId, "set_options", {
        theme: selectedTheme,
        questionCount,
      });

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedTheme, count: questionCount }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      await performAction(roomCode, playerId, "load_questions", {
        questions: data.questions,
      });
    } catch {
      setError("Failed to generate questions. Try again.");
    }
    setLoading(false);
  }

  async function handleStartGame() {
    setError("");
    const result = await performAction(roomCode, playerId, "start_game");
    if (!result.success) {
      setError(result.error || "Failed to start game");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Game Lobby</h1>
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
          <span className="text-white/60 text-sm">Room Code</span>
          <span className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
            {roomCode}
          </span>
        </div>
        <p className="text-white/50 text-xs mt-1">
          Share this code with friends
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs text-black font-bold">
            {state.room.players.length}
          </span>
          Players
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {state.room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm truncate">
                {player.name}
              </span>
              {player.isHost && (
                <span className="text-yellow-400 text-xs ml-auto shrink-0">
                  HOST
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 flex-1">
          <h2 className="text-white font-semibold mb-3">Game Settings</h2>

          <div className="mb-4">
            <label className="text-white/70 text-sm mb-2 block">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    theme === t
                      ? "bg-yellow-400 text-black scale-105"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setTheme("custom")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  theme === "custom"
                    ? "bg-yellow-400 text-black scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Custom...
              </button>
            </div>
            {theme === "custom" && (
              <input
                type="text"
                placeholder="Enter custom theme..."
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-400"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="text-white/70 text-sm mb-2 block">
              Questions: {questionCount}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
            <div className="flex justify-between text-white/40 text-xs">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
          )}

          {!questionsReady ? (
            <button
              onClick={handleGenerateQuestions}
              disabled={loading || !selectedTheme}
              className="w-full py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating Questions...
                </span>
              ) : (
                "Generate Questions"
              )}
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="w-full py-3 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98] animate-pulse"
            >
              Start Game!
            </button>
          )}
        </div>
      )}

      {!isHost && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-yellow-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <p className="text-white text-lg font-medium">
              Waiting for host to start...
            </p>
            {state.room.theme && (
              <p className="text-yellow-400 mt-2">
                Theme: {state.room.theme}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
