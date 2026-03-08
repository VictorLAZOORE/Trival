import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { theme, count } = await req.json();

    if (!theme || !count || count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Invalid theme or count" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(theme, count);
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
