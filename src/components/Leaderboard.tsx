"use client";

import { Player } from "@/types/game";

interface LeaderboardProps {
  players: Player[];
  currentQuestion?: number;
  totalQuestions?: number;
  isFinal?: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({
  players,
  currentQuestion,
  totalQuestions,
  isFinal,
}: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center p-4">
      <div className="text-center mb-6 mt-4">
        <h1 className="text-3xl font-bold text-white">
          {isFinal ? "Final Results" : "Leaderboard"}
        </h1>
        {!isFinal && currentQuestion !== undefined && totalQuestions !== undefined && (
          <p className="text-white/60 mt-1">
            After question {currentQuestion} of {totalQuestions}
          </p>
        )}
      </div>

      <div className="w-full max-w-lg space-y-3">
        {sorted.map((player, idx) => {
          const barWidth = maxScore > 0 ? (player.score / maxScore) * 100 : 0;

          return (
            <div
              key={player.id}
              className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 transition-all"
              style={{
                animationDelay: `${idx * 100}ms`,
                animation: "slideUp 0.4s ease-out forwards",
                opacity: 0,
                transform: "translateY(20px)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center shrink-0">
                  {idx < 3 ? (
                    <span className="text-2xl">{MEDALS[idx]}</span>
                  ) : (
                    <span className="text-white/50 font-bold">{idx + 1}</span>
                  )}
                </div>

                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold truncate">
                      {player.name}
                    </span>
                    <span className="text-yellow-400 font-bold ml-2">
                      {player.score.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
