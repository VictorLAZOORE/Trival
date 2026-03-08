"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useGamePolling } from "@/hooks/useGamePolling";
import { performAction } from "@/lib/api";
import Lobby from "@/components/Lobby";
import QuestionCard from "@/components/QuestionCard";
import AnswerReveal from "@/components/AnswerReveal";
import Leaderboard from "@/components/Leaderboard";
import WinnerScreen from "@/components/WinnerScreen";
import { sounds } from "@/lib/sounds";

export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [answered, setAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const prevStatusRef = useRef("");
  const prevQuestionRef = useRef(-1);

  useEffect(() => {
    const pid = sessionStorage.getItem(`trival_player_${code}`);
    if (!pid) {
      router.push("/");
      return;
    }
    setPlayerId(pid);
  }, [code, router]);

  const { state, error } = useGamePolling(code, playerId);

  useEffect(() => {
    if (!state) return;

    const newStatus = state.room.status;
    const prevStatus = prevStatusRef.current;
    const questionNum = state.question?.questionNumber ?? -1;

    if (newStatus === "playing" && prevStatus !== "playing") {
      sounds.gameStart();
      setAnswered(false);
      setSelectedChoice(null);
    }

    if (
      newStatus === "playing" &&
      questionNum !== prevQuestionRef.current &&
      prevQuestionRef.current !== -1
    ) {
      sounds.tick();
      setAnswered(false);
      setSelectedChoice(null);
    }

    if (newStatus === "showing_answer" && prevStatus === "playing") {
      if (state.myAnswer?.correct) {
        sounds.correct();
        setWasCorrect(true);
        setPointsEarned(state.myAnswer.points);
      } else {
        sounds.wrong();
        setWasCorrect(false);
        setPointsEarned(0);
      }
      if (state.myAnswer) {
        setSelectedChoice(state.myAnswer.choice);
      }
    }

    prevStatusRef.current = newStatus;
    prevQuestionRef.current = questionNum;
  }, [state]);

  const handleAnswer = useCallback(
    async (choice: number) => {
      if (answered) return;
      setAnswered(true);
      setSelectedChoice(choice);

      const result = await performAction(code, playerId, "submit_answer", {
        choice,
      });
      if (result.success) {
        setWasCorrect(result.correct);
        setPointsEarned(result.points);
      }
    },
    [answered, code, playerId]
  );

  const handlePlayAgain = useCallback(async () => {
    await performAction(code, playerId, "play_again");
  }, [code, playerId]);

  if (error === "Room not found" || error === "You are not in this room") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-white text-lg">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    );
  }

  switch (state.room.status) {
    case "lobby":
      return <Lobby state={state} playerId={playerId} roomCode={code} />;

    case "playing":
      return state.question ? (
        <QuestionCard
          question={state.question.question}
          choices={state.question.choices}
          questionNumber={state.question.questionNumber}
          totalQuestions={state.question.totalQuestions}
          timeLimit={state.question.timeLeft}
          onAnswer={handleAnswer}
          answered={answered}
          selectedChoice={selectedChoice}
        />
      ) : null;

    case "showing_answer":
      return state.answerReveal ? (
        <AnswerReveal
          choices={state.answerReveal.choices}
          correctAnswer={state.answerReveal.correctAnswer}
          choiceCounts={state.answerReveal.choiceCounts}
          selectedChoice={selectedChoice}
          wasCorrect={wasCorrect}
          pointsEarned={pointsEarned}
          players={state.leaderboard || state.room.players}
        />
      ) : null;

    case "leaderboard":
      return (
        <Leaderboard
          players={state.leaderboard || state.room.players}
          currentQuestion={state.currentQuestion}
          totalQuestions={state.totalQuestions}
        />
      );

    case "finished":
      return (
        <WinnerScreen
          players={state.leaderboard || state.room.players}
          playerId={playerId}
          isHost={playerId === state.room.host}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return null;
  }
}
