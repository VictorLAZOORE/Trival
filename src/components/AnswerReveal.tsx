"use client";

import { useEffect } from "react";
import { Player } from "@/types/game";
import { sounds } from "@/lib/sounds";

interface AnswerRevealProps {
  choices: string[];
  correctAnswer: number;
  choiceCounts: number[];
  selectedChoice: number | null;
  wasCorrect: boolean;
  pointsEarned: number;
  players: Player[];
}

const ANSWER_COLORS_BG = [
  "bg-red-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
];

export default function AnswerReveal({
  choices,
  correctAnswer,
  choiceCounts,
  selectedChoice,
  wasCorrect,
  pointsEarned,
}: AnswerRevealProps) {
  useEffect(() => {
    if (wasCorrect) {
      sounds.correct();
    } else {
      sounds.wrong();
    }
  }, [wasCorrect]);

  const totalAnswers = choiceCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4">
      <div
        className={`mb-6 text-center animate-[scale-in_0.3s_ease-out] ${
          wasCorrect ? "text-green-400" : "text-red-400"
        }`}
      >
        <div className="text-6xl mb-2">{wasCorrect ? "✓" : "✗"}</div>
        <h2 className="text-2xl font-bold text-white">
          {wasCorrect ? "Correct!" : "Wrong!"}
        </h2>
        {wasCorrect && (
          <p className="text-yellow-400 text-lg font-semibold mt-1">
            +{pointsEarned} points
          </p>
        )}
      </div>

      <div className="w-full max-w-lg space-y-3">
        {choices.map((choice, idx) => {
          const isCorrect = idx === correctAnswer;
          const isSelected = idx === selectedChoice;
          const percentage =
            totalAnswers > 0 ? Math.round((choiceCounts[idx] / totalAnswers) * 100) : 0;

          return (
            <div
              key={idx}
              className={`relative rounded-2xl p-4 transition-all ${
                isCorrect
                  ? "bg-green-500 ring-4 ring-green-300 scale-[1.02]"
                  : isSelected
                  ? "bg-red-500/60 ring-2 ring-red-300"
                  : "bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-semibold ${
                    isCorrect || isSelected ? "text-white" : "text-white/70"
                  }`}
                >
                  {choice}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium">
                    {choiceCounts[idx]}
                  </span>
                  {isCorrect && <span className="text-white text-lg">✓</span>}
                </div>
              </div>
              <div className="mt-2 h-2 bg-black/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCorrect ? "bg-green-300" : ANSWER_COLORS_BG[idx]
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
