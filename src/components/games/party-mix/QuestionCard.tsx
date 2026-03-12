"use client";

import type { PartyMixCurrentItem } from "@/app/games/party-mix/types";

interface QuestionCardProps {
  item: PartyMixCurrentItem;
  onNext: () => void;
}

export default function QuestionCard({ item, onNext }: QuestionCardProps) {
  return (
    <div
      className="w-full max-w-lg mx-auto animate-[party-mix-in_0.4s_ease-out]"
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        {/* Type de jeu */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-2xl" aria-hidden>
            {item.emoji}
          </span>
          <span className="font-bold text-white/90 text-sm uppercase tracking-wider">
            {item.label}
            {item.subType && (
              <span className="ml-2 text-amber-300 font-normal">
                · {item.subType === "truth" ? "Vérité" : "Défi"}
              </span>
            )}
          </span>
        </div>

        {/* Instruction */}
        <p className="text-center text-white/60 text-xs px-4 pt-2">
          {item.instruction}
        </p>

        {/* Phrase / question */}
        <div className="px-6 py-8 min-h-[140px] flex items-center justify-center">
          <p className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed">
            {item.text}
          </p>
        </div>

        {/* Boutons */}
        <div className="p-4 pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-500 to-amber-500 text-white shadow-lg shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Nouvelle question
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-lg bg-white/15 text-white border border-white/30 hover:bg-white/25 active:scale-[0.98] transition-all"
          >
            J&apos;ai bu / OK
          </button>
        </div>
      </div>
    </div>
  );
}
