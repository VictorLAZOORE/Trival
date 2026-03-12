export interface GameConfig {
  id: string;
  name: string;
  description: string;
  href: string;
  emoji: string;
  gradient: string;
}

export const GAMES: GameConfig[] = [
  {
    id: "trival",
    name: "Trival Quiz",
    description: "Quiz multijoueur en temps réel. Réponds vite, marque des points !",
    href: "/games/trival",
    emoji: "🎯",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "drink-roulette",
    name: "Drink Roulette",
    description: "Une roulette tourne… Qui va boire ? 🔥",
    href: "/games/drink-roulette",
    emoji: "🍸",
    gradient: "from-rose-500 to-fuchsia-600",
  },
  {
    id: "party-mix",
    name: "Party Mix",
    description: "Never Have I Ever, Vérité/Défi, Le plus susceptible… en un jeu.",
    href: "/games/party-mix",
    emoji: "🎉",
    gradient: "from-violet-500 to-amber-500",
  },
  {
    id: "chooser",
    name: "Le Chooser",
    description: "Posez vos doigts sur l'écran, on choisit au hasard qui est désigné.",
    href: "/games/chooser",
    emoji: "👆",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "guess-head",
    name: "Devine Tête",
    description: "Place un mot sur ton front, fais-le deviner aux autres.",
    href: "/games/guess-head",
    emoji: "🧠",
    gradient: "from-cyan-500 to-indigo-600",
  },
];
