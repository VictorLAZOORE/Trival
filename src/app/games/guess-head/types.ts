export interface GuessHeadPlayer {
  id: string;
  name: string;
  color: string;
  score: number;
}

export type WordSource = "preset" | "custom" | "ai";

export interface GuessHeadRound {
  words: string[]; // indexé par joueur
  index: number; // index du joueur courant
  number: number; // numéro de manche (1, 2, 3…)
}

