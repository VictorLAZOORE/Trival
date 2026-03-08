import { NextRequest, NextResponse } from "next/server";
import { gameManager } from "@/server/gameManager";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { playerId, action } = body;

    if (!playerId || !action) {
      return NextResponse.json(
        { error: "playerId and action are required" },
        { status: 400 }
      );
    }

    const room = gameManager.getRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.players.has(playerId)) {
      return NextResponse.json(
        { error: "You are not in this room" },
        { status: 403 }
      );
    }

    switch (action) {
      case "set_options": {
        const { theme, questionCount } = body;
        const ok = gameManager.setOptions(
          room,
          playerId,
          theme,
          questionCount
        );
        return NextResponse.json({ success: ok });
      }

      case "load_questions": {
        const { questions } = body;
        const ok = gameManager.loadQuestions(room, playerId, questions);
        return NextResponse.json({ success: ok });
      }

      case "start_game": {
        const result = gameManager.startGame(room, playerId);
        return NextResponse.json(result);
      }

      case "submit_answer": {
        const { choice } = body;
        const result = gameManager.submitAnswer(room, playerId, choice);
        if (!result) {
          return NextResponse.json({
            success: false,
            error: "Answer not accepted",
          });
        }
        return NextResponse.json({
          success: true,
          correct: result.correct,
          points: result.points,
        });
      }

      case "play_again": {
        const ok = gameManager.playAgain(room, playerId);
        return NextResponse.json({ success: ok });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Action failed" },
      { status: 500 }
    );
  }
}
