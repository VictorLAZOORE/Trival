"use client";

import type { GuessHeadPlayer, GuessHeadRound } from "@/app/games/guess-head/types";

interface RoundViewProps {
  players: GuessHeadPlayer[];
  round: GuessHeadRound;
  onNext: (action: "guessed" | "pass") => void;
}

export default function RoundView({ players, round, onNext }: RoundViewProps) {
  const currentPlayer = players[round.index];
  const currentWord = round.words[round.index] ?? "Mot mystère";

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 gap-6">
      <header className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.15em] text-white/60">
          Manche {round.number}
        </p>
        <p className="text-sm text-white/70">
          C&apos;est au tour de{" "}
          <span className="font-semibold text-white">{currentPlayer.name}</span>
        </p>
        <p className="text-xs text-white/50">
          Tiens le téléphone sur ton front, les autres doivent te faire deviner !
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {players.map((p, idx) => (
          <div
            key={p.id}
            className={`px-3 py-1.5 rounded-2xl border text-xs flex items-center gap-1.5 ${
              idx === round.index
                ? "bg-cyan-500/80 border-cyan-200 text-black font-semibold"
                : "bg-white/5 border-white/15 text-white/70"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-xl px-4">
        <div className="rounded-[2.25rem] border border-white/25 bg-white/10 backdrop-blur-xl py-10 px-6 shadow-2xl flex items-center justify-center">
          <p className="text-3xl md:text-5xl font-black text-center text-white tracking-wide leading-tight">
            {currentWord}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xl px-4 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onNext("pass")}
          className="flex-1 py-3.5 rounded-2xl font-bold text-base bg-white/15 text-white border border-white/30 hover:bg-white/25 active:scale-[0.98] transition-all"
        >
          Passer
        </button>
        <button
          type="button"
          onClick={() => onNext("guessed")}
          className="flex-1 py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-400 to-cyan-500 text-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          J&apos;ai deviné !
        </button>
      </div>
    </div>
  );
}

