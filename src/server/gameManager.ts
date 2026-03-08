import {
  Room,
  Player,
  GameStateResponse,
  TriviaQuestion,
  PLAYER_COLORS,
  QUESTION_TIME,
  SHOW_ANSWER_TIME,
  LEADERBOARD_TIME,
  MAX_POINTS,
} from "@/types/game";
import { v4 as uuidv4 } from "uuid";

class GameManager {
  private rooms: Map<string, Room> = new Map();

  generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.has(code)) return this.generateRoomCode();
    return code;
  }

  createRoom(hostName: string): { code: string; playerId: string } {
    const code = this.generateRoomCode();
    const playerId = uuidv4();
    const host: Player = {
      id: playerId,
      name: hostName,
      score: 0,
      color: PLAYER_COLORS[0],
      isHost: true,
      hasAnswered: false,
    };

    const room: Room = {
      code,
      host: playerId,
      players: new Map([[playerId, host]]),
      questions: [],
      currentQuestion: -1,
      status: "lobby",
      theme: "",
      questionCount: 5,
      questionStartTime: 0,
      phaseStartTime: 0,
      answers: new Map(),
      questionsReady: false,
      lastActivity: Date.now(),
    };

    this.rooms.set(code, room);
    return { code, playerId };
  }

  joinRoom(
    code: string,
    playerName: string
  ): { playerId: string } | { error: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: "Room not found" };
    if (room.status !== "lobby")
      return { error: "Game already in progress" };
    if (room.players.size >= 12) return { error: "Room is full" };

    const playerId = uuidv4();
    const color = PLAYER_COLORS[room.players.size % PLAYER_COLORS.length];
    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      color,
      isHost: false,
      hasAnswered: false,
    };

    room.players.set(playerId, player);
    room.lastActivity = Date.now();
    return { playerId };
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  tick(room: Room): void {
    const now = Date.now();

    if (room.status === "playing") {
      const elapsed = (now - room.questionStartTime) / 1000;
      if (elapsed >= QUESTION_TIME) {
        room.status = "showing_answer";
        room.phaseStartTime = now;
      }
    } else if (room.status === "showing_answer") {
      const elapsed = (now - room.phaseStartTime) / 1000;
      if (elapsed >= SHOW_ANSWER_TIME) {
        if (this.isLastQuestion(room)) {
          room.status = "finished";
          room.phaseStartTime = now;
        } else {
          room.status = "leaderboard";
          room.phaseStartTime = now;
        }
      }
    } else if (room.status === "leaderboard") {
      const elapsed = (now - room.phaseStartTime) / 1000;
      if (elapsed >= LEADERBOARD_TIME) {
        this.startQuestion(room);
      }
    }
  }

  startQuestion(room: Room): void {
    room.currentQuestion++;
    room.status = "playing";
    room.questionStartTime = Date.now();
    room.phaseStartTime = Date.now();
    room.answers.clear();
    for (const player of room.players.values()) {
      player.hasAnswered = false;
    }
  }

  submitAnswer(
    room: Room,
    playerId: string,
    choice: number
  ): { correct: boolean; points: number } | null {
    if (room.status !== "playing") return null;
    if (room.answers.has(playerId)) return null;

    const elapsed = (Date.now() - room.questionStartTime) / 1000;
    if (elapsed > QUESTION_TIME) return null;

    room.answers.set(playerId, { choice, time: elapsed });

    const player = room.players.get(playerId);
    if (!player) return null;
    player.hasAnswered = true;

    const question = room.questions[room.currentQuestion];
    const correct = choice === question.correct;
    let points = 0;

    if (correct) {
      const timeBonus = Math.max(0, 1 - elapsed / QUESTION_TIME);
      points = Math.round(MAX_POINTS * (0.5 + 0.5 * timeBonus));
      player.score += points;
    }

    if (this.allAnswered(room)) {
      room.status = "showing_answer";
      room.phaseStartTime = Date.now();
    }

    room.lastActivity = Date.now();
    return { correct, points };
  }

  allAnswered(room: Room): boolean {
    return room.answers.size >= room.players.size;
  }

  getLeaderboard(room: Room): Player[] {
    return Array.from(room.players.values()).sort(
      (a, b) => b.score - a.score
    );
  }

  isLastQuestion(room: Room): boolean {
    return room.currentQuestion >= room.questions.length - 1;
  }

  getAnswerStats(room: Room) {
    const question = room.questions[room.currentQuestion];
    const choiceCounts = [0, 0, 0, 0];

    for (const answer of room.answers.values()) {
      choiceCounts[answer.choice]++;
    }

    return {
      correctAnswer: question.correct,
      choiceCounts,
    };
  }

  setOptions(
    room: Room,
    playerId: string,
    theme: string,
    questionCount: number
  ): boolean {
    if (room.host !== playerId) return false;
    room.theme = theme;
    room.questionCount = questionCount;
    room.lastActivity = Date.now();
    return true;
  }

  loadQuestions(
    room: Room,
    playerId: string,
    questions: TriviaQuestion[]
  ): boolean {
    if (room.host !== playerId) return false;
    room.questions = questions;
    room.questionsReady = true;
    room.lastActivity = Date.now();
    return true;
  }

  startGame(
    room: Room,
    playerId: string
  ): { success: boolean; error?: string } {
    if (room.host !== playerId)
      return { success: false, error: "Not authorized" };
    if (!room.questionsReady || room.questions.length === 0)
      return { success: false, error: "Questions not loaded yet" };

    this.startQuestion(room);
    room.lastActivity = Date.now();
    return { success: true };
  }

  playAgain(room: Room, playerId: string): boolean {
    if (room.host !== playerId) return false;
    room.status = "lobby";
    room.currentQuestion = -1;
    room.questions = [];
    room.questionsReady = false;
    room.answers.clear();
    for (const player of room.players.values()) {
      player.score = 0;
      player.hasAnswered = false;
    }
    room.lastActivity = Date.now();
    return true;
  }

  getGameState(room: Room, playerId: string): GameStateResponse {
    this.tick(room);

    const players = Array.from(room.players.values());
    const myPlayer = room.players.get(playerId);

    const base: GameStateResponse = {
      room: {
        code: room.code,
        status: room.status,
        players,
        host: room.host,
        theme: room.theme,
        questionCount: room.questionCount,
        questionsReady: room.questionsReady,
      },
      myPlayer,
    };

    if (room.status === "playing" && room.currentQuestion >= 0) {
      const q = room.questions[room.currentQuestion];
      const elapsed = (Date.now() - room.questionStartTime) / 1000;
      return {
        ...base,
        question: {
          question: q.question,
          choices: q.choices,
          questionNumber: room.currentQuestion + 1,
          totalQuestions: room.questions.length,
          timeLeft: Math.max(0, Math.ceil(QUESTION_TIME - elapsed)),
        },
        answeredCount: room.answers.size,
        totalPlayers: room.players.size,
      };
    }

    if (room.status === "showing_answer" && room.currentQuestion >= 0) {
      const stats = this.getAnswerStats(room);
      const q = room.questions[room.currentQuestion];
      const myRawAnswer = room.answers.get(playerId);
      let myAnswer: GameStateResponse["myAnswer"] = null;
      if (myRawAnswer) {
        const correct = myRawAnswer.choice === stats.correctAnswer;
        const timeBonus = Math.max(
          0,
          1 - myRawAnswer.time / QUESTION_TIME
        );
        myAnswer = {
          choice: myRawAnswer.choice,
          correct,
          points: correct
            ? Math.round(MAX_POINTS * (0.5 + 0.5 * timeBonus))
            : 0,
        };
      }
      return {
        ...base,
        answerReveal: {
          correctAnswer: stats.correctAnswer,
          choiceCounts: stats.choiceCounts,
          choices: q.choices,
        },
        myAnswer,
        leaderboard: this.getLeaderboard(room),
      };
    }

    if (room.status === "leaderboard") {
      return {
        ...base,
        leaderboard: this.getLeaderboard(room),
        currentQuestion: room.currentQuestion + 1,
        totalQuestions: room.questions.length,
      };
    }

    if (room.status === "finished") {
      return {
        ...base,
        leaderboard: this.getLeaderboard(room),
      };
    }

    return base;
  }

  cleanup(): void {
    const now = Date.now();
    const timeout = 30 * 60 * 1000;
    for (const [code, room] of this.rooms) {
      if (now - room.lastActivity > timeout) {
        this.rooms.delete(code);
      }
    }
  }
}

const globalForGame = globalThis as unknown as { gameManager?: GameManager };
export const gameManager = globalForGame.gameManager ?? new GameManager();
globalForGame.gameManager = gameManager;
