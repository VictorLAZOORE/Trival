"use client";

import { useState } from "react";
import type { GuessHeadPlayer, WordSource } from "@/app/games/guess-head/types";
import { PRESET_THEMES } from "@/app/games/guess-head/data";

interface SetupFormProps {
  onStart: (params: {
    players: GuessHeadPlayer[];
    source: WordSource;
    presetThemeId?: string;
    customWords?: string[];
    aiTheme?: string;
    aiWords?: string[];
  }) => void;
}

const PLAYER_COLORS = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#e11d48",
  "#a855f7",
  "#eab308",
  "#06b6d4",
  "#facc15",
];

export default function SetupForm({ onStart }: SetupFormProps) {
  const [nameInput, setNameInput] = useState("");
  const [players, setPlayers] = useState<GuessHeadPlayer[]>([]);
  const [source, setSource] = useState<WordSource>("preset");
  const [presetThemeId, setPresetThemeId] = useState(PRESET_THEMES[0]?.id);
  const [customWords, setCustomWords] = useState<
    { id: string; value: string; hidden: boolean }[]
  >([{ id: "0", value: "", hidden: false }]);
  const [aiTheme, setAiTheme] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiWords, setAiWords] = useState<string[] | null>(null);
  const [startError, setStartError] = useState("");

  function addPlayer() {
    const name = nameInput.trim();
    if (!name) return;
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length]!;
    setPlayers((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, name, color, score: 0 },
    ]);
    setNameInput("");
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function addCustomWordRow() {
    setCustomWords((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, value: "", hidden: false },
    ]);
  }

  function updateCustomWord(id: string, value: string) {
    setCustomWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, value } : w))
    );
  }

  function hideCustomWord(id: string) {
    setCustomWords((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, hidden: true } : w
      )
    );
  }

  async function handleGenerateAI() {
    const theme = aiTheme.trim();
    if (!theme) {
      setAiError("Entre un thème (ex: Célébrités, Animés, Sport, etc.)");
      return;
    }
    setAiError("");
    setAiLoading(true);
    try {
      const res = await fetch("/api/guess-head-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, count: 40 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAiError(data.error || "Impossible de générer des mots, réessaie.");
        setAiWords(null);
      } else {
        setAiWords(data.words as string[]);
      }
    } catch {
      setAiError("Erreur réseau. Réessaie plus tard.");
      setAiWords(null);
    } finally {
      setAiLoading(false);
    }
  }

  function handleStart() {
    setStartError("");
    if (players.length < 2) {
      setStartError("Ajoute au moins 2 joueurs.");
      return;
    }

    let customWordValues: string[] | undefined;
    if (source === "custom") {
      customWordValues = customWords
        .map((w) => w.value.trim())
        .filter(Boolean);
      if (!customWordValues.length) {
        setStartError("Ajoute au moins un mot personnalisé.");
        return;
      }
    }

    if (source === "ai") {
      if (!aiWords || aiWords.length === 0) {
        setStartError("Génère d'abord des mots avec l'IA.");
        return;
      }
    }

    onStart({
      players,
      source,
      presetThemeId,
      customWords: customWordValues,
      aiTheme: source === "ai" ? aiTheme.trim() : undefined,
      aiWords: source === "ai" ? aiWords ?? undefined : undefined,
    });
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <section className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">
            1
          </span>
          Joueurs
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Prénom du joueur"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
            maxLength={16}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={addPlayer}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500 text-sm font-bold text-black hover:bg-cyan-400 active:scale-95 transition-all"
          >
            Ajouter
          </button>
        </div>
        {players.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => removePlayer(p.id)}
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 bg-white/10 text-white text-sm border border-white/15 hover:bg-white/20 transition-colors"
              >
                <span
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.name}</span>
                <span className="text-xs text-white/50">×</span>
              </button>
            ))}
          </div>
        )}
        {players.length === 0 && (
          <p className="text-white/40 text-xs">
            Ajoute au moins 2 prénoms pour commencer.
          </p>
        )}
      </section>

      <section className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15 space-y-4">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold">
            2
          </span>
          Choix des mots
        </h2>

        <div className="grid grid-cols-3 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSource("preset")}
            className={`py-2 rounded-2xl border ${
              source === "preset"
                ? "bg-violet-500 text-white border-violet-400"
                : "bg-white/5 text-white/70 border-white/15"
            }`}
          >
            Liste préfaite
          </button>
          <button
            type="button"
            onClick={() => setSource("custom")}
            className={`py-2 rounded-2xl border ${
              source === "custom"
                ? "bg-violet-500 text-white border-violet-400"
                : "bg-white/5 text-white/70 border-white/15"
            }`}
          >
            Mots perso
          </button>
          <button
            type="button"
            onClick={() => setSource("ai")}
            className={`py-2 rounded-2xl border ${
              source === "ai"
                ? "bg-violet-500 text-white border-violet-400"
                : "bg-white/5 text-white/70 border-white/15"
            }`}
          >
            IA (OpenAI)
          </button>
        </div>

        {source === "preset" && (
          <div className="space-y-2">
            <p className="text-white/60 text-xs">
              Choisis un thème, les mots seront tirés au hasard dedans.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPresetThemeId(t.id)}
                  className={`rounded-2xl border px-3 py-2 text-left text-xs transition-all ${
                    presetThemeId === t.id
                      ? "bg-violet-500/90 border-violet-300 text-white"
                      : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base" aria-hidden>
                      {t.emoji}
                    </span>
                    <span className="font-semibold">{t.label}</span>
                  </div>
                  <p className="text-[11px] text-white/60 line-clamp-2">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {source === "custom" && (
          <div className="space-y-2">
            <p className="text-white/60 text-xs">
              Un mot ou personnage par case (ex: « Zidane », « Chat », « Pikachu »…).
              Appuie sur l&apos;oeil pour le cacher une fois tapé.
            </p>
            <div className="space-y-2">
              {customWords.map((w, index) => (
                <div key={w.id} className="flex items-center gap-2">
                  <input
                    type={w.hidden ? "password" : "text"}
                    value={w.value}
                    onChange={(e) => updateCustomWord(w.id, e.target.value)}
                    placeholder={
                      index === 0
                        ? "Harry Potter"
                        : index === 1
                        ? "Zidane"
                        : index === 2
                        ? "Pikachu"
                        : "Autre mot…"
                    }
                    maxLength={40}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-violet-400 disabled:opacity-70"
                    disabled={w.hidden}
                  />
                  <button
                    type="button"
                    onClick={() => hideCustomWord(w.id)}
                    disabled={!w.value.trim() || w.hidden}
                    className="px-3 py-2 rounded-2xl border border-white/25 bg-white/10 text-xs text-white/80 hover:bg-white/20 active:scale-95 disabled:opacity-40 disabled:hover:bg-white/10 transition-all"
                  >
                    Cacher
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCustomWordRow}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-white"
            >
              <span className="text-base leading-none">＋</span> Ajouter un mot
            </button>
          </div>
        )}

        {source === "ai" && (
          <div className="space-y-2">
            <p className="text-white/60 text-xs">
              Donne un thème et laisse l&apos;IA proposer des mots (nécessite une clé OpenAI).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTheme}
                onChange={(e) => setAiTheme(e.target.value)}
                placeholder="Ex: Personnages de séries, Foot, Marvel…"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-2xl bg-violet-500 text-sm font-bold text-white hover:bg-violet-400 active:scale-95 transition-all disabled:opacity-60"
              >
                {aiLoading ? "IA..." : "Générer"}
              </button>
            </div>
            {aiError && (
              <p className="text-red-400 text-xs">{aiError}</p>
            )}
            {aiWords && aiWords.length > 0 && (
              <p className="text-emerald-400 text-xs">
                {aiWords.length} mots générés. Tu peux lancer la partie !
              </p>
            )}
          </div>
        )}
      </section>

      {startError && (
        <p className="text-red-400 text-xs text-center">{startError}</p>
      )}

      <button
        type="button"
        onClick={handleStart}
        className="w-full py-3.5 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        Lancer la partie
      </button>
    </div>
  );
}

