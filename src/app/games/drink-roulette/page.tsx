"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { sounds } from "@/lib/sounds";
import confetti from "canvas-confetti";
import type { DrinkRouletteClientRoom } from "@/types/drinkRoulette";
import { DRINK_ROULETTE_COLORS } from "@/types/drinkRoulette";
import RouletteWheel from "@/components/games/drink-roulette/RouletteWheel";
import type { DrinkRoulettePlayer } from "@/types/drinkRoulette";

const STORAGE_KEY = "trival_dr_name";

type View = "choice" | "online" | "local" | "localGame";

function makeLocalPlayers(names: string[]): DrinkRoulettePlayer[] {
  return names.map((name, i) => ({
    id: `local-${i}`,
    name: name.trim(),
    color: DRINK_ROULETTE_COLORS[i % DRINK_ROULETTE_COLORS.length],
    isHost: false,
  }));
}

export default function DrinkRoulettePage() {
  const router = useRouter();
  const [view, setView] = useState<View>("choice");

  // Online
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openRooms, setOpenRooms] = useState<DrinkRouletteClientRoom[]>([]);

  // Local
  const [localNames, setLocalNames] = useState<string[]>([]);
  const [localNameInput, setLocalNameInput] = useState("");
  const [localWinnerId, setLocalWinnerId] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState<string[]>([]);

  const fetchRooms = useCallback(() => {
    const socket = getSocket();
    socket.emit("list_rooms_dr", (rooms: DrinkRouletteClientRoom[]) => {
      setOpenRooms(rooms);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, playerName.trim());
  }

  function handleCreateRoom() {
    if (!playerName.trim()) {
      setError("Entre ton pseudo");
      return;
    }
    setLoading(true);
    setError("");
    saveName();

    const socket = getSocket();
    socket.emit(
      "create_room_dr",
      { playerName: playerName.trim() },
      (response: {
        success: boolean;
        room?: DrinkRouletteClientRoom;
        error?: string;
      }) => {
        setLoading(false);
        if (response.success && response.room) {
          sessionStorage.setItem(
            `room_dr_${response.room.code}`,
            JSON.stringify(response.room)
          );
          router.push(`/games/drink-roulette/room/${response.room.code}`);
        } else {
          setError(response.error || "Erreur");
        }
      }
    );
  }

  function joinRoomByCode(code: string) {
    if (!playerName.trim()) {
      setError("Entre ton pseudo");
      return;
    }
    setLoading(true);
    setError("");
    saveName();

    const socket = getSocket();
    socket.emit(
      "join_room_dr",
      {
        code: code.trim().toUpperCase(),
        playerName: playerName.trim(),
      },
      (response: {
        success: boolean;
        room?: DrinkRouletteClientRoom;
        error?: string;
      }) => {
        setLoading(false);
        if (response.success && response.room) {
          sessionStorage.setItem(
            `room_dr_${response.room.code}`,
            JSON.stringify(response.room)
          );
          router.push(`/games/drink-roulette/room/${response.room.code}`);
        } else {
          setError(response.error || "Erreur");
        }
      }
    );
  }

  function handleJoinRoom() {
    if (!roomCode.trim()) {
      setError("Entre le code de la salle");
      return;
    }
    joinRoomByCode(roomCode);
  }

  // Local: add name
  function addLocalName() {
    const name = localNameInput.trim();
    if (!name) return;
    if (localNames.includes(name)) return;
    setLocalNames((prev) => [...prev, name]);
    setLocalNameInput("");
  }

  function removeLocalName(index: number) {
    setLocalNames((prev) => prev.filter((_, i) => i !== index));
  }

  // Local: spin
  const handleLocalSpin = useCallback(() => {
    if (localNames.length < 2) return;
    const players = makeLocalPlayers(localNames);
    const winnerIndex = Math.floor(Math.random() * players.length);
    console.log(winnerIndex);
    const winner = players[winnerIndex];
    console.log(winner);  
    setLocalWinnerId(winner.id);
    setLocalHistory((h) => [...h.slice(-9), winner.name]);
    sounds.spin();
  }, [localNames]);

  const handleLocalSpinComplete = useCallback(() => {
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

  const localPlayers = makeLocalPlayers(localNames);

  const header = (
    <>
      <div className="flex items-center justify-center mb-6">
        <Link
          href={view === "choice" ? "/" : "#"}
          onClick={(e) => {
            if (view !== "choice") {
              e.preventDefault();
              setView("choice");
              setError("");
              setLocalWinnerId(null);
            }
          }}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour
        </Link>
      </div>

      <div className="text-center mb-8">
        <span className="text-5xl block mb-2">🍸</span>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-pink-400 mb-2">
          DRINK ROULETTE
        </h1>
        <p className="text-white/60 text-sm">La roue tourne… Qui boit ?</p>
      </div>
    </>
  );

  // —— Choice: Jouer en ligne / Jouer en local ——
  if (view === "choice") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {header}

          <div className="space-y-4">
            <button
              onClick={() => setView("online")}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🌐</span>
              Jouer en ligne
            </button>
            <button
              onClick={() => setView("local")}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📱</span>
              Jouer en local
            </button>
          </div>

          <p className="text-white/30 text-xs text-center mt-8">
            Soirée entre amis — joue responsable
          </p>
        </div>
      </div>
    );
  }

  // —— Online: create/join (unchanged flow) ——
  if (view === "online") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {header}

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 space-y-5">
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">
                Ton pseudo
              </label>
              <input
                type="text"
                placeholder="Entre ton nom..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={16}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 transition-all text-lg"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-rose-500/30"
            >
              {loading ? "Création..." : "Créer une salle"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-sm">OU</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">
                Code de la salle
              </label>
              <input
                type="text"
                placeholder="Code à 6 caractères"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/50 transition-all text-lg tracking-widest text-center font-mono"
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-fuchsia-500/30"
            >
              {loading ? "Connexion..." : "Rejoindre"}
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
                Salles ouvertes
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
                        <span className="text-rose-300 font-mono font-bold text-sm tracking-wider">
                          {room.code}
                        </span>
                        <div className="text-white/50 text-xs mt-0.5">
                          {hostPlayer?.name || "—"} · {room.players.length}/12
                        </div>
                      </div>
                      <button
                        onClick={() => joinRoomByCode(room.code)}
                        disabled={loading}
                        className="shrink-0 ml-3 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        Rejoindre
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-white/30 text-xs text-center mt-6">
            Soirée entre amis — joue responsable
          </p>
        </div>
      </div>
    );
  }

  // —— Local: add names then launch ——
  if (view === "local") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {header}

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 space-y-5">
            <p className="text-white/70 text-sm">
              Ajoute les prénoms des joueurs (un écran, tout le monde autour).
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Prénom..."
                value={localNameInput}
                onChange={(e) => setLocalNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLocalName()}
                maxLength={20}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:outline-none focus:border-rose-400 transition-all"
              />
              <button
                type="button"
                onClick={addLocalName}
                className="px-4 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all"
              >
                Ajouter
              </button>
            </div>

            {localNames.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/60 text-sm">
                  {localNames.length} joueur{localNames.length > 1 ? "s" : ""}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {localNames.map((name, i) => (
                    <li
                      key={`${name}-${i}`}
                      className="inline-flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-2 text-white"
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => removeLocalName(i)}
                        className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold leading-none"
                        aria-label="Retirer"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setView("localGame")}
              disabled={localNames.length < 2}
              className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-rose-500/30"
            >
              Lancer la roulette
            </button>
            {localNames.length > 0 && localNames.length < 2 && (
              <p className="text-white/50 text-xs text-center">
                Ajoute au moins 2 joueurs
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // —— Local game: roulette + spin + history ——
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            setView("local");
            setLocalWinnerId(null);
          }}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Modifier les noms
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <RouletteWheel
          players={localPlayers}
          winnerId={localWinnerId}
          isSpinning={!!localWinnerId}
          onSpinComplete={handleLocalSpinComplete}
        />

        <button
          onClick={() => {
            setLocalWinnerId(null);
            setTimeout(handleLocalSpin, 50);
          }}
          disabled={localPlayers.length < 2}
          className="px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          Tourner la roulette
        </button>
      </div>

      {localHistory.length > 0 && (
        <div className="mt-6 bg-white/5 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-medium mb-2">Derniers choisis</h3>
          <p className="text-white/50 text-sm">
            {localHistory.slice(-5).reverse().join(" → ")}
          </p>
        </div>
      )}
    </div>
  );
}
