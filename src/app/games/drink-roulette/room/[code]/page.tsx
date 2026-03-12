"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { sounds } from "@/lib/sounds";
import confetti from "canvas-confetti";
import type { DrinkRouletteClientRoom } from "@/types/drinkRoulette";
import RouletteWheel from "@/components/games/drink-roulette/RouletteWheel";

export default function DrinkRouletteRoomPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const [room, setRoom] = useState<DrinkRouletteClientRoom | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [spinLoading, setSpinLoading] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    setPlayerId(socket.id || "");

    socket.on("connect", () => setPlayerId(socket.id || ""));

    socket.on("player_joined_dr", ({ room: updatedRoom }: { room: DrinkRouletteClientRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on("player_left_dr", ({ room: updatedRoom }: { room: DrinkRouletteClientRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on("roulette_result", ({ winnerId: wId, history: h }: { winnerId: string; winnerName: string; history: string[] }) => {
      sounds.spin();
      setWinnerId(wId);
      setHistory(h);
      setSpinLoading(false);
    });

    const stored = sessionStorage.getItem(`room_dr_${code}`);
    if (stored) {
      const parsed = JSON.parse(stored) as DrinkRouletteClientRoom;
      setRoom(parsed);
    } else {
      router.push("/games/drink-roulette");
    }

    return () => {
      socket.off("connect");
      socket.off("player_joined_dr");
      socket.off("player_left_dr");
      socket.off("roulette_result");
    };
  }, [code, router]);

  const handleSpin = useCallback(() => {
    if (room?.players.length && room.players.length < 2) return;
    setSpinLoading(true);
    setWinnerId(null);

    const socket = getSocket();
    socket.emit(
      "spin_roulette",
      { code },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          setSpinLoading(false);
          if (response.error) alert(response.error);
        }
      }
    );
  }, [code, room?.players.length]);

  const handleSpinComplete = useCallback(() => {
    sounds.drinkWinner();
    const duration = 2500;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.6 },
        colors: ["#f43f5e", "#d946ef", "#ec4899", "#fbbf24"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.6 },
        colors: ["#f43f5e", "#d946ef", "#ec4899", "#fbbf24"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleLeave = useCallback(() => {
    const socket = getSocket();
    socket.emit("leave_room_dr", { code });
    sessionStorage.removeItem(`room_dr_${code}`);
    router.push("/games/drink-roulette");
  }, [code, router]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-rose-400 rounded-full" />
      </div>
    );
  }

  const isHost = playerId === room.host;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/games/drink-roulette"
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
          onClick={(e) => {
            e.preventDefault();
            handleLeave();
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Quitter
        </Link>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
          <span className="text-white/60 text-sm">Code</span>
          <span className="text-rose-300 font-mono font-bold tracking-wider">{room.code}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <RouletteWheel
          players={room.players}
          winnerId={winnerId}
          isSpinning={spinLoading}
          onSpinComplete={handleSpinComplete}
        />

        {isHost && (
          <button
            onClick={handleSpin}
            disabled={spinLoading || room.players.length < 2}
            className="px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {spinLoading ? "La roue tourne..." : "Tourner la roulette"}
          </button>
        )}

        {!isHost && room.players.length < 2 && (
          <p className="text-white/60 text-sm">En attente de l&apos;hôte pour lancer la roue...</p>
        )}
      </div>

      {/* Players */}
      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {room.players.length}
          </span>
          Joueurs
        </h2>
        <div className="flex flex-wrap gap-2">
          {room.players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm">{p.name}</span>
              {p.isHost && <span className="text-rose-300 text-xs">HÔTE</span>}
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4 bg-white/5 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-medium mb-2">Derniers choisis</h3>
          <p className="text-white/50 text-sm">
            {history.slice(-5).reverse().join(" → ")}
          </p>
        </div>
      )}
    </div>
  );
}
