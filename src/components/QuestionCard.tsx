"use client";

import { useState, useEffect, useCallback } from "react";
import { QUESTION_TIME } from "@/types/game";
import { sounds } from "@/lib/sounds";

interface QuestionCardProps {
  question: string;
  choices: string[];
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  onAnswer: (choice: number) => void;
  answered: boolean;
  selectedChoice: number | null;
}

const ANSWER_COLORS = [
  "from-red-500 to-red-600",
  "from-blue-500 to-blue-600",
  "from-yellow-500 to-yellow-600",
  "from-green-500 to-green-600",
];

const ANSWER_SHAPES = ["triangle", "diamond", "circle", "square"];

function Shape({ type }: { type: string }) {
  switch (type) {
    case "triangle":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,22 2,22" />
        </svg>
      );
    case "diamond":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case "circle":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "square":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="20" height="20" rx="2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function QuestionCard({
  question,
  choices,
  questionNumber,
  totalQuestions,
  timeLimit,
  onAnswer,
  answered,
  selectedChoice,
}: QuestionCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [question, timeLimit]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 3 && next > 0) sounds.countdown();
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, question]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered) return;
      onAnswer(idx);
    },
    [answered, onAnswer]
  );

  const progress = (timeLeft / QUESTION_TIME) * 100;
  const timerColor =
    timeLeft <= 3 ? "bg-red-500" : timeLeft <= 7 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <span className="text-white/70 text-sm font-medium">
          {questionNumber}/{totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              timeLeft <= 3 ? "animate-pulse bg-red-500" : "bg-white/20"
            }`}
          >
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-white/10">
        <div
          className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-lg">
          <h2 className="text-white text-xl md:text-2xl font-bold text-center leading-tight">
            {question}
          </h2>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={answered}
            className={`relative bg-gradient-to-br ${ANSWER_COLORS[idx]} rounded-2xl p-4 text-white font-semibold text-left transition-all active:scale-[0.97] min-h-[72px] flex items-center gap-3 ${
              answered
                ? selectedChoice === idx
                  ? "ring-4 ring-white scale-[1.02]"
                  : "opacity-50"
                : "hover:scale-[1.02] hover:shadow-lg"
            }`}
          >
            <span className="shrink-0 opacity-70">
              <Shape type={ANSWER_SHAPES[idx]} />
            </span>
            <span className="text-base md:text-lg">{choice}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-4 animate-bounce">
            <p className="text-white text-lg font-bold">Answer submitted!</p>
          </div>
        </div>
      )}
    </div>
  );
}
