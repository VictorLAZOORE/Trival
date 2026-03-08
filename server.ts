import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { gameManager } from "./src/server/gameManager";
import {
  QUESTION_TIME,
  SHOW_ANSWER_TIME,
  LEADERBOARD_TIME,
} from "./src/types/game";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/api/socketio",
  });

  const questionTimers: Map<string, NodeJS.Timeout> = new Map();

  function clearRoomTimer(code: string) {
    const timer = questionTimers.get(code);
    if (timer) {
      clearTimeout(timer);
      questionTimers.delete(code);
    }
  }

  function advanceGame(roomCode: string) {
    const room = gameManager.getRoom(roomCode);
    if (!room) return;

    if (room.status === "playing") {
      room.status = "showing_answer";
      const stats = gameManager.getAnswerStats(room);
      io.to(roomCode).emit("answer_reveal", {
        ...stats,
        players: Array.from(room.players.values()),
      });

      questionTimers.set(
        roomCode,
        setTimeout(() => advanceGame(roomCode), SHOW_ANSWER_TIME * 1000)
      );
    } else if (room.status === "showing_answer") {
      if (gameManager.isLastQuestion(room)) {
        room.status = "finished";
        io.to(roomCode).emit("game_finished", {
          leaderboard: gameManager.getLeaderboard(room),
        });
        clearRoomTimer(roomCode);
      } else {
        room.status = "leaderboard";
        io.to(roomCode).emit("show_leaderboard", {
          leaderboard: gameManager.getLeaderboard(room),
          currentQuestion: room.currentQuestion + 1,
          totalQuestions: room.questions.length,
        });

        questionTimers.set(
          roomCode,
          setTimeout(() => advanceGame(roomCode), LEADERBOARD_TIME * 1000)
        );
      }
    } else if (room.status === "leaderboard") {
      gameManager.startQuestion(room);
      const q = room.questions[room.currentQuestion];
      io.to(roomCode).emit("new_question", {
        question: q.question,
        choices: q.choices,
        questionNumber: room.currentQuestion + 1,
        totalQuestions: room.questions.length,
        timeLimit: QUESTION_TIME,
      });

      questionTimers.set(
        roomCode,
        setTimeout(() => advanceGame(roomCode), QUESTION_TIME * 1000)
      );
    }
  }

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("list_rooms", (callback) => {
      callback(gameManager.getOpenRooms());
    });

    socket.on("create_room", ({ playerName }, callback) => {
      const room = gameManager.createRoom(socket.id, playerName);
      socket.join(room.code);
      callback({ success: true, room: gameManager.toClientRoom(room) });
    });

    socket.on("join_room", ({ code, playerName }, callback) => {
      const result = gameManager.joinRoom(code, socket.id, playerName);
      if (!result) {
        callback({
          success: false,
          error: "Room not found, game already started, or room is full",
        });
        return;
      }
      socket.join(result.room.code);
      callback({
        success: true,
        room: gameManager.toClientRoom(result.room),
      });
      socket.to(result.room.code).emit("player_joined", {
        player: result.player,
        room: gameManager.toClientRoom(result.room),
      });
    });

    socket.on("set_game_options", ({ code, theme, questionCount }) => {
      const room = gameManager.getRoom(code);
      if (!room || room.host !== socket.id) return;
      room.theme = theme;
      room.questionCount = questionCount;
      io.to(code).emit("options_updated", {
        theme,
        questionCount,
      });
    });

    socket.on("load_questions", ({ code, questions }) => {
      const room = gameManager.getRoom(code);
      if (!room || room.host !== socket.id) return;
      room.questions = questions;
    });

    socket.on("start_game", async ({ code }, callback) => {
      const room = gameManager.getRoom(code);
      if (!room || room.host !== socket.id) {
        callback?.({ success: false, error: "Not authorized" });
        return;
      }
      if (room.questions.length === 0) {
        callback?.({ success: false, error: "Questions not loaded yet" });
        return;
      }

      gameManager.startQuestion(room);
      const q = room.questions[room.currentQuestion];

      io.to(code).emit("game_started", {
        question: q.question,
        choices: q.choices,
        questionNumber: 1,
        totalQuestions: room.questions.length,
        timeLimit: QUESTION_TIME,
      });

      questionTimers.set(
        code,
        setTimeout(() => advanceGame(code), QUESTION_TIME * 1000)
      );

      callback?.({ success: true });
    });

    socket.on("submit_answer", ({ code, choice }, callback) => {
      const room = gameManager.getRoom(code);
      if (!room) return;

      const result = gameManager.submitAnswer(room, socket.id, choice);
      if (!result) {
        callback?.({ success: false });
        return;
      }

      callback?.({ success: true, correct: result.correct, points: result.points });

      io.to(code).emit("player_answered", {
        playerId: socket.id,
        answeredCount: room.answers.size,
        totalPlayers: room.players.size,
      });

      if (gameManager.allAnswered(room)) {
        clearRoomTimer(code);
        advanceGame(code);
      }
    });

    socket.on("play_again", ({ code }) => {
      const room = gameManager.getRoom(code);
      if (!room || room.host !== socket.id) return;

      clearRoomTimer(code);
      room.status = "lobby";
      room.currentQuestion = -1;
      room.questions = [];
      room.answers.clear();
      for (const player of room.players.values()) {
        player.score = 0;
        player.hasAnswered = false;
      }

      io.to(code).emit("room_reset", {
        room: gameManager.toClientRoom(room),
      });
    });

    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);
      const result = gameManager.removePlayer(socket.id);
      if (result && result.room.players.size > 0) {
        io.to(result.room.code).emit("player_left", {
          room: gameManager.toClientRoom(result.room),
        });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
