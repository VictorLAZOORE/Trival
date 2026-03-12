export interface DrinkRoulettePlayer {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
}

export interface DrinkRouletteRoom {
  code: string;
  host: string;
  players: Map<string, DrinkRoulettePlayer>;
  history: string[]; // player names who were selected (newest last)
}

export interface DrinkRouletteClientRoom {
  code: string;
  host: string;
  players: DrinkRoulettePlayer[];
  history: string[];
}

export const DRINK_ROULETTE_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F1948A",
  "#82E0AA",
];
