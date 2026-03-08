"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { ClientRoom } from "@/types/game";

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openRooms, setOpenRooms] = useState<ClientRoom[]>([]);

  const fetchRooms = useCallback(() => {
    const socket = getSocket();
    socket.emit("list_rooms", (rooms: ClientRoom[]) => {
      setOpenRooms(rooms);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("trival_name");
    if (saved) setPlayerName(saved);

    const socket = getSocket();
    socket.on("connect", fetchRooms);
    if (socket.connected) fetchRooms();

    const interval = setInterval(fetchRooms, 5000);
    return () => {
      clearInterval(interval);
      socket.off("connect", fetchRooms);
    };
  }, [fetchRooms]);

  function saveName() {
    localStorage.setItem("trival_name", playerName.trim());
  }

  async function handleCreateRoom() {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    saveName();

    const socket = getSocket();

    socket.emit(
      "create_room",
      { playerName: playerName.trim() },
      (response: { success: boolean; room?: ClientRoom; error?: string }) => {
        setLoading(false);
        if (response.success && response.room) {
          sessionStorage.setItem(
            `room_${response.room.code}`,
            JSON.stringify(response.room)
          );
          router.push(`/room/${response.room.code}`);
        } else {
          setError(response.error || "Failed to create room");
        }
      }
    );
  }

  function joinRoomByCode(code: string) {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    saveName();

    const socket = getSocket();

    socket.emit(
      "join_room",
      { code: code.trim().toUpperCase(), playerName: playerName.trim() },
      (response: { success: boolean; room?: ClientRoom; error?: string }) => {
        setLoading(false);
        if (response.success && response.room) {
          sessionStorage.setItem(
            `room_${response.room.code}`,
            JSON.stringify(response.room)
          );
          router.push(`/room/${response.room.code}`);
        } else {
          setError(response.error || "Failed to join room");
        }
      }
    );
  }

  async function handleJoinRoom() {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    joinRoomByCode(roomCode);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 mb-2">
            TRIVAL
          </h1>
          <p className="text-white/60 text-sm">Real-time multiplayer trivia</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 space-y-5">
          <div>
            <label className="text-white/70 text-sm font-medium mb-1.5 block">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={16}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all text-lg"
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-sm">OR</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <div>
            <label className="text-white/70 text-sm font-medium mb-1.5 block">
              Room Code
            </label>
            <input
              type="text"
              placeholder="Enter room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all text-lg tracking-widest text-center font-mono"
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center animate-pulse">
              {error}
            </p>
          )}
        </div>

        {openRooms.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 mt-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Open Games
            </h2>
            <div className="space-y-2">
              {openRooms.map((room) => {
                const hostPlayer = room.players.find((p) => p.isHost);
                return (
                  <div
                    key={room.code}
                    className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-mono font-bold text-sm tracking-wider">
                          {room.code}
                        </span>
                        {room.theme && (
                          <span className="text-white/40 text-xs truncate">
                            {room.theme}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/50 text-xs">
                          {hostPlayer?.name || "—"}
                        </span>
                        <span className="text-white/30 text-xs">
                          {room.players.length}/12
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => joinRoomByCode(room.code)}
                      disabled={loading}
                      className="shrink-0 ml-3 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      Join
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-white/30 text-xs text-center mt-6">
          Play on any device — no app required
        </p>
      </div>
    </div>
  );
}
