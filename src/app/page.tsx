"use client";

import Link from "next/link";
import { GAMES } from "@/config/games";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 mb-2 drop-shadow-lg">
            TRIVAL
          </h1>
          <p className="text-white/50 text-sm md:text-base">Plateforme de mini-jeux</p>
        </header>

        <h2 className="text-xl font-bold text-white/90 mb-6 text-center">
          Choisis un jeu
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="group block bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {game.emoji}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
              <p className="text-white/60 text-sm mb-5 line-clamp-2">
                {game.description}
              </p>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r ${game.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}
              >
                Jouer
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <p className="text-white/30 text-xs text-center mt-8">
          Joue sur n&apos;importe quel appareil — pas d&apos;app requise
        </p>
      </div>
    </div>
  );
}
