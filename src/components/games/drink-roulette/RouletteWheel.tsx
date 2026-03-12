"use client";

import { useEffect, useRef, useState } from "react";
import type { DrinkRoulettePlayer } from "@/types/drinkRoulette";

const SPIN_DURATION_MS = 3800;
const FULL_TURNS = 6;

interface RouletteWheelProps {
  players: DrinkRoulettePlayer[];
  winnerId: string | null;
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

export default function RouletteWheel({
  players,
  winnerId,
  onSpinComplete,
}: RouletteWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [displayWinner, setDisplayWinner] = useState<string | null>(null);
  const prevWinnerRef = useRef<string | null>(null);

  useEffect(() => {
    if (winnerId === null) setDisplayWinner(null);
  }, [winnerId]);

  useEffect(() => {
    if (!winnerId || players.length === 0) return;

    const winnerIndex = players.findIndex((p) => p.id === winnerId);
    if (winnerIndex === -1) return;

    const segmentAngle = 360 / players.length;
    // Land in the middle of the segment, with a small random offset so we never sit on a boundary
    const segmentCenter = (winnerIndex + 0.5) * segmentAngle;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7;
    const winnerCenterAngle = segmentCenter + randomOffset;
    // Pointer at top: after rotate(R), viewport top shows wheel angle (360 - R) mod 360
    const targetEndAngle = (360 - winnerCenterAngle + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (targetEndAngle - currentMod + 360) % 360;
    const finalAngle = FULL_TURNS * 360 + delta;

    prevWinnerRef.current = winnerId;
    setRotation(rotation + finalAngle);

    const done = setTimeout(() => {
      setDisplayWinner(winnerId);
      onSpinComplete?.();
    }, SPIN_DURATION_MS);

    return () => clearTimeout(done);
  }, [winnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (players.length === 0) {
    return (
      <div className="w-64 h-64 rounded-full bg-white/10 flex items-center justify-center text-white/50">
        En attente de joueurs...
      </div>
    );
  }

  const segmentAngle = 360 / players.length;
  const conicGradient = players
    .map(
      (p, i) =>
        `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
    )
    .join(", ");

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="absolute z-20 w-0 h-0 border-l-[24px] border-r-[24px] border-t-[40px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg"
        style={{ top: "-12px" }}
      />

      <div
        className="relative w-72 h-72 rounded-full overflow-hidden shadow-2xl border-8 border-amber-400/90"
        style={{
          boxShadow:
            "0 0 0 4px rgba(0,0,0,0.3), inset 0 0 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          ref={wheelRef}
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${conicGradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: winnerId
              ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
              : "none",
          }}
        />
        {/* Labels overlay: same rotation so they move with wheel */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: winnerId
              ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
              : "none",
          }}
        >
          {players.map((player, i) => {
            const angle = ((i + 0.5) * segmentAngle * Math.PI) / 180;
            const r = 42;
            const x = 50 + r * Math.sin(angle);
            const y = 50 - r * Math.cos(angle);
            return (
              <div
                key={player.id}
                className="absolute text-white font-bold text-sm drop-shadow-md text-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  width: "70px",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {player.name.length > 6
                  ? player.name.slice(0, 5) + "…"
                  : player.name}
              </div>
            );
          })}
        </div>
      </div>

      {displayWinner && (
        <div className="mt-6 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-center animate-pulse">
          <p className="text-2xl md:text-3xl font-black">
            🔥 {players.find((p) => p.id === displayWinner)?.name} boit !
          </p>
        </div>
      )}
    </div>
  );
}
