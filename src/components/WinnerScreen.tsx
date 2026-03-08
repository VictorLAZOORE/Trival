"use client";

import { useEffect } from "react";
import { Player } from "@/types/game";
import { sounds } from "@/lib/sounds";
import confetti from "canvas-confetti";
import Leaderboard from "./Leaderboard";

interface WinnerScreenProps {
  players: Player[];
  playerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
}

export default function WinnerScreen({
  players,
  playerId,
  isHost,
  onPlayAgain,
}: WinnerScreenProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isWinner = winner?.id === playerId;

  useEffect(() => {
    sounds.winner();

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      <div className="text-center pt-8 pb-4 px-4">
        <div className="text-6xl mb-2">🏆</div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {isWinner ? "You Win!" : `${winner?.name} Wins!`}
        </h1>
        <p className="text-yellow-400 text-xl font-semibold">
          {winner?.score.toLocaleString()} points
        </p>
      </div>

      <div className="flex-1">
        <Leaderboard players={players} isFinal />
      </div>

      <div className="p-4 pb-8">
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Play Again
          </button>
        ) : (
          <p className="text-white/60 text-center">
            Waiting for host to start a new game...
          </p>
        )}
      </div>
    </div>
  );
}
