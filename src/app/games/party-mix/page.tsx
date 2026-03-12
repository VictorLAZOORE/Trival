"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  PARTY_MIX_CATEGORIES,
  getRandomCategory,
  getRandomItemForCategory,
} from "./data";
import type { PartyMixCurrentItem } from "./types";
import QuestionCard from "@/components/games/party-mix/QuestionCard";

function buildCurrentItem(): PartyMixCurrentItem {
  const categoryId = getRandomCategory();
  const config = PARTY_MIX_CATEGORIES.find((c) => c.id === categoryId)!;
  const { text, subType } = getRandomItemForCategory(categoryId);

  let displayText = text;
  if (categoryId === "never_have_i_ever") {
    displayText = `Je n'ai jamais ${text}`;
  } else if (categoryId === "most_likely") {
    const de = /^[aeiouàâäéèêëïîôùûü]/i.test(text) ? "d'" : "de ";
    displayText = `Qui est le plus susceptible ${de}${text} ?`;
  }

  return {
    categoryId,
    label: config.shortLabel,
    emoji: config.emoji,
    instruction: config.instruction,
    text: displayText,
    subType,
  };
}

export default function PartyMixPage() {
  const [current, setCurrent] = useState<PartyMixCurrentItem | null>(() =>
    buildCurrentItem()
  );
  const [key, setKey] = useState(0);

  const nextQuestion = useCallback(() => {
    setCurrent(buildCurrentItem());
    setKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-amber-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
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
        <span className="text-white/50 text-sm font-medium">Party Mix</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <header className="text-center mb-8">
          <span className="text-5xl block mb-2" aria-hidden>
            🎉
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300">
            Party Mix
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Never Have I Ever · Vérité / Défi · Le plus susceptible · Défis
          </p>
        </header>

        {current && (
          <div key={key} className="w-full">
            <QuestionCard item={current} onNext={nextQuestion} />
          </div>
        )}
      </div>

      <p className="text-white/30 text-xs text-center mt-4">
        Joue responsable — tout est local, pas de connexion
      </p>
    </div>
  );
}
