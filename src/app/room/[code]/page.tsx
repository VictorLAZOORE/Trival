"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { ClientRoom, Player } from "@/types/game";
import Lobby from "@/components/Lobby";
import QuestionCard from "@/components/QuestionCard";
import AnswerReveal from "@/components/AnswerReveal";
import Leaderboard from "@/components/Leaderboard";
import WinnerScreen from "@/components/WinnerScreen";
import { sounds } from "@/lib/sounds";

interface QuestionData {
  question: string;
  choices: string[];
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
}

interface AnswerRevealData {
  correctAnswer: number;
  choiceCounts: number[];
  players: Player[];
}

interface LeaderboardData {
  leaderboard: Player[];
  currentQuestion: number;
  totalQuestions: number;
}

type GamePhase = "lobby" | "question" | "answer_reveal" | "leaderboard" | "finished";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<ClientRoom | null>(null);
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [answerData, setAnswerData] = useState<AnswerRevealData | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [finishedPlayers, setFinishedPlayers] = useState<Player[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [playerId, setPlayerId] = useState("");

  useEffect(() => {
    const socket = getSocket();
    setPlayerId(socket.id || "");

    socket.on("connect", () => {
      setPlayerId(socket.id || "");
    });

    socket.on("player_joined", ({ room: updatedRoom }: { room: ClientRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on("player_left", ({ room: updatedRoom }: { room: ClientRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on("options_updated", ({ theme, questionCount }: { theme: string; questionCount: number }) => {
      setRoom((prev) =>
        prev ? { ...prev, theme, questionCount } : prev
      );
    });

    socket.on("game_started", (data: QuestionData) => {
      sounds.gameStart();
      setQuestionData(data);
      setPhase("question");
      setAnswered(false);
      setSelectedChoice(null);
    });

    socket.on("new_question", (data: QuestionData) => {
      sounds.tick();
      setQuestionData(data);
      setPhase("question");
      setAnswered(false);
      setSelectedChoice(null);
    });

    socket.on("answer_reveal", (data: AnswerRevealData) => {
      setAnswerData(data);
      setPhase("answer_reveal");
    });

    socket.on("show_leaderboard", (data: LeaderboardData) => {
      setLeaderboardData(data);
      setPhase("leaderboard");
    });

    socket.on("game_finished", ({ leaderboard }: { leaderboard: Player[] }) => {
      setFinishedPlayers(leaderboard);
      setPhase("finished");
    });

    socket.on("room_reset", ({ room: updatedRoom }: { room: ClientRoom }) => {
      setRoom(updatedRoom);
      setPhase("lobby");
      setQuestionData(null);
      setAnswerData(null);
      setLeaderboardData(null);
      setFinishedPlayers([]);
      setAnswered(false);
      setSelectedChoice(null);
    });

    const storedRoom = sessionStorage.getItem(`room_${code}`);
    if (storedRoom) {
      setRoom(JSON.parse(storedRoom));
    } else {
      router.push("/");
    }

    return () => {
      socket.off("connect");
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("options_updated");
      socket.off("game_started");
      socket.off("new_question");
      socket.off("answer_reveal");
      socket.off("show_leaderboard");
      socket.off("game_finished");
      socket.off("room_reset");
    };
  }, [code, router]);

  const handleAnswer = useCallback(
    (choice: number) => {
      if (answered) return;
      setAnswered(true);
      setSelectedChoice(choice);

      const socket = getSocket();
      socket.emit(
        "submit_answer",
        { code, choice },
        (response: { success: boolean; correct?: boolean; points?: number }) => {
          if (response.success) {
            setWasCorrect(response.correct || false);
            setPointsEarned(response.points || 0);
          }
        }
      );
    },
    [answered, code]
  );

  const handlePlayAgain = useCallback(() => {
    const socket = getSocket();
    socket.emit("play_again", { code });
  }, [code]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    );
  }

  switch (phase) {
    case "lobby":
      return (
        <Lobby
          room={room}
          playerId={playerId}
          onGameStart={() => {}}
        />
      );

    case "question":
      return questionData ? (
        <QuestionCard
          question={questionData.question}
          choices={questionData.choices}
          questionNumber={questionData.questionNumber}
          totalQuestions={questionData.totalQuestions}
          timeLimit={questionData.timeLimit}
          onAnswer={handleAnswer}
          answered={answered}
          selectedChoice={selectedChoice}
        />
      ) : null;

    case "answer_reveal":
      return answerData && questionData ? (
        <AnswerReveal
          choices={questionData.choices}
          correctAnswer={answerData.correctAnswer}
          choiceCounts={answerData.choiceCounts}
          selectedChoice={selectedChoice}
          wasCorrect={wasCorrect}
          pointsEarned={pointsEarned}
          players={answerData.players}
        />
      ) : null;

    case "leaderboard":
      return leaderboardData ? (
        <Leaderboard
          players={leaderboardData.leaderboard}
          currentQuestion={leaderboardData.currentQuestion}
          totalQuestions={leaderboardData.totalQuestions}
        />
      ) : null;

    case "finished":
      return (
        <WinnerScreen
          players={finishedPlayers}
          playerId={playerId}
          isHost={playerId === room.host}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return null;
  }
}
