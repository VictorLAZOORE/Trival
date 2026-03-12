import { NextRequest, NextResponse } from "next/server";
import { generateGuessHeadWords } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { theme, count } = await req.json();
    const safeCount =
      typeof count === "number" && count > 0 && count <= 80 ? count : 40;
    if (!theme || typeof theme !== "string") {
      return NextResponse.json(
        { error: "Thème invalide pour la génération IA." },
        { status: 400 }
      );
    }

    const words = await generateGuessHeadWords(theme, safeCount, "fr");
    return NextResponse.json({ words });
  } catch (error) {
    console.error("guess-head-words API error", error);
    return NextResponse.json(
      { error: "Impossible de générer des mots." },
      { status: 500 }
    );
  }
}

