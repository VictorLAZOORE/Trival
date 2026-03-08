import {
  Room,
  Player,
  ClientRoom,
  PLAYER_COLORS,
  QUESTION_TIME,
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

  createRoom(hostSocketId: string, hostName: string): Room {
    const code = this.generateRoomCode();
    const host: Player = {
      id: hostSocketId,
      name: hostName,
      score: 0,
      color: PLAYER_COLORS[0],
      isHost: true,
      hasAnswered: false,
    };

    const room: Room = {
      code,
      host: hostSocketId,
      players: new Map([[hostSocketId, host]]),
      questions: [],
      currentQuestion: -1,
      status: "lobby",
      theme: "",
      questionCount: 5,
      questionStartTime: 0,
      answers: new Map(),
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(
    code: string,
    playerId: string,
    playerName: string
  ): { room: Room; player: Player } | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;
    if (room.status !== "lobby") return null;
    if (room.players.size >= 12) return null;

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
    return { room, player };
  }

  removePlayer(playerId: string): { room: Room; wasHost: boolean } | null {
    for (const [code, room] of this.rooms) {
      if (room.players.has(playerId)) {
        const wasHost = room.host === playerId;
        room.players.delete(playerId);

        if (room.players.size === 0) {
          this.rooms.delete(code);
          return { room, wasHost };
        }

        if (wasHost) {
          const newHost = room.players.values().next().value;
          if (newHost) {
            newHost.isHost = true;
            room.host = newHost.id;
          }
        }

        return { room, wasHost };
      }
    }
    return null;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) return room;
    }
    return undefined;
  }

  toClientRoom(room: Room): ClientRoom {
    return {
      code: room.code,
      host: room.host,
      players: Array.from(room.players.values()),
      currentQuestion: room.currentQuestion,
      status: room.status,
      theme: room.theme,
      questionCount: room.questionCount,
      totalQuestions: room.questions.length,
    };
  }

  startQuestion(room: Room): void {
    room.currentQuestion++;
    room.status = "playing";
    room.questionStartTime = Date.now();
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

  getAnswerStats(room: Room): {
    correctAnswer: number;
    choiceCounts: number[];
    playerResults: { name: string; correct: boolean; points: number }[];
  } {
    const question = room.questions[room.currentQuestion];
    const choiceCounts = [0, 0, 0, 0];
    const playerResults: { name: string; correct: boolean; points: number }[] =
      [];

    for (const [pid, answer] of room.answers) {
      choiceCounts[answer.choice]++;
      const player = room.players.get(pid);
      if (player) {
        const correct = answer.choice === question.correct;
        const timeBonus = Math.max(0, 1 - answer.time / QUESTION_TIME);
        const points = correct
          ? Math.round(MAX_POINTS * (0.5 + 0.5 * timeBonus))
          : 0;
        playerResults.push({ name: player.name, correct, points });
      }
    }

    return {
      correctAnswer: question.correct,
      choiceCounts,
      playerResults,
    };
  }
}

export const gameManager = new GameManager();
