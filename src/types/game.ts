export interface TriviaQuestion {
  question: string;
  choices: string[];
  correct: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  isHost: boolean;
  hasAnswered: boolean;
}

export interface Room {
  code: string;
  host: string;
  players: Map<string, Player>;
  questions: TriviaQuestion[];
  currentQuestion: number;
  status: "lobby" | "playing" | "showing_answer" | "leaderboard" | "finished";
  theme: string;
  questionCount: number;
  questionStartTime: number;
  answers: Map<string, { choice: number; time: number }>;
}

export interface ClientRoom {
  code: string;
  host: string;
  players: Player[];
  currentQuestion: number;
  status: Room["status"];
  theme: string;
  questionCount: number;
  totalQuestions: number;
}

export interface GameAnswer {
  playerId: string;
  choice: number;
  time: number;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: number;
  pointsEarned: number;
  players: Player[];
}

export const PLAYER_COLORS = [
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

export const THEMES = [
  "Movies",
  "History",
  "Science",
  "Geography",
  "Sports",
  "Music",
  "Technology",
  "Literature",
  "Food & Drinks",
  "Animals",
];

export const QUESTION_TIME = 15;
export const SHOW_ANSWER_TIME = 4;
export const LEADERBOARD_TIME = 5;
export const MAX_POINTS = 1000;
