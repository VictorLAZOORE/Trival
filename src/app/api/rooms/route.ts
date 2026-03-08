import { NextRequest, NextResponse } from "next/server";
import { gameManager } from "@/server/gameManager";

export async function POST(req: NextRequest) {
  try {
    const { playerName } = await req.json();
    if (!playerName?.trim()) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    gameManager.cleanup();
    const { code, playerId } = gameManager.createRoom(playerName.trim());
    return NextResponse.json({ code, playerId });
  } catch {
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
