import { NextRequest, NextResponse } from "next/server";
import { gameManager } from "@/server/gameManager";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const playerId = req.nextUrl.searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json(
      { error: "playerId is required" },
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

  const state = gameManager.getGameState(room, playerId);
  return NextResponse.json(state);
}
