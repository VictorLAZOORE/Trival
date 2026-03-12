"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PRESET_THEMES, pickWordsForPlayers } from "./data";
import type { GuessHeadPlayer, GuessHeadRound, WordSource } from "./types";
import SetupForm from "@/components/games/guess-head/SetupForm";
import RoundView from "@/components/games/guess-head/RoundView";

type Phase = "setup" | "play";

export default function GuessHeadPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<GuessHeadPlayer[]>([]);
  const [round, setRound] = useState<GuessHeadRound | null>(null);
  const [source, setSource] = useState<WordSource>("preset");
  const [title, setTitle] = useState<string>("Devine Tête");

  const startGame = useCallback(
    (params: {
      players: GuessHeadPlayer[];
      source: WordSource;
      presetThemeId?: string;
      customWords?: string[];
      aiTheme?: string;
      aiWords?: string[];
    }) => {
      const { players, source, presetThemeId, customWords, aiTheme, aiWords } =
        params;
      setPlayers(players);
      setSource(source);

      let baseWords: string[] = [];
      if (source === "preset") {
        const selected =
          PRESET_THEMES.find((t) => t.id === presetThemeId) ?? PRESET_THEMES[0];
        baseWords = selected.words;
        setTitle(`Devine Tête — ${selected.emoji} ${selected.label}`);
      } else if (source === "custom") {
        baseWords = customWords ?? [];
        setTitle("Devine Tête — Mots perso");
      } else if (source === "ai") {
        baseWords = aiWords ?? [];
        setTitle(`Devine Tête — IA · ${aiTheme || "Thème personnalisé"}`);
      }

      const words = pickWordsForPlayers(baseWords, players.length);
      setRound({
        words,
        index: 0,
        number: 1,
      });
      setPhase("play");
    },
    []
  );

  const nextTurn = useCallback(
    (_action: "guessed" | "pass") => {
      if (!round || players.length === 0) return;
      // On pourrait augmenter le score du joueur si _action === "guessed"
      const nextIndex = round.index + 1;
      if (nextIndex < players.length) {
        setRound({
          ...round,
          index: nextIndex,
        });
      } else {
        // Nouvelle manche : tout le monde a joué
        const baseWords =
          source === "preset"
            ? (() => {
                const label = title.split("—")[1]?.trim() ?? "";
                const match = PRESET_THEMES.find((t) =>
                  label.includes(t.label)
                );
                return match?.words ?? PRESET_THEMES[0].words;
              })()
            : round.words;
        const newWords = pickWordsForPlayers(baseWords, players.length);
        setRound({
          words: newWords,
          index: 0,
          number: round.number + 1,
        });
      }
    },
    [players.length, round, source, title]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-indigo-950 to-fuchsia-950 flex flex-col p-4">
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
        <span className="text-white/50 text-xs md:text-sm font-medium">
          Devine Tête
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <header className="text-center space-y-1">
          <span className="text-4xl md:text-5xl block" aria-hidden>
            🧠
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300">
            Devine Tête
          </h1>
          <p className="text-white/70 text-xs md:text-sm max-w-md mx-auto">
            Pose le téléphone sur ton front, les autres te font deviner qui tu es
            sans dire le mot.
          </p>
        </header>

        {phase === "setup" && (
          <SetupForm
            onStart={startGame}
          />
        )}

        {phase === "play" && round && (
          <RoundView
            players={players}
            round={round}
            onNext={nextTurn}
          />
        )}
      </div>

      <p className="text-white/30 text-[11px] text-center mt-4">
        Local uniquement — parfait pour les soirées. Joue responsable.
      </p>
    </div>
  );
}

