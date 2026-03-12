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
];
