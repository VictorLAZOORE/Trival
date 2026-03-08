import OpenAI from "openai";
import { TriviaQuestion } from "@/types/game";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuestions(
  theme: string,
  count: number
): Promise<TriviaQuestion[]> {
  const prompt = `Generate ${count} trivia questions about "${theme}". 
Return a JSON array where each element has:
- "question": the trivia question (string)
- "choices": exactly 4 answer options (string array)
- "correct": the index (0-3) of the correct answer

Make questions fun, varied in difficulty, and factually accurate.
Return ONLY the JSON array, no markdown or extra text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a trivia question generator. Return only valid JSON arrays.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response from OpenAI");

    const cleaned = content.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const questions: TriviaQuestion[] = JSON.parse(cleaned);

    return questions.map((q) => ({
      question: q.question,
      choices: q.choices.slice(0, 4),
      correct: q.correct,
    }));
  } catch (error) {
    console.error("OpenAI generation failed, using fallback questions:", error);
    return generateFallbackQuestions(theme, count);
  }
}

function generateFallbackQuestions(
  theme: string,
  count: number
): TriviaQuestion[] {
  const fallbacks: Record<string, TriviaQuestion[]> = {
    default: [
      {
        question: "What planet is known as the Red Planet?",
        choices: ["Earth", "Mars", "Venus", "Jupiter"],
        correct: 1,
      },
      {
        question: "What is the largest ocean on Earth?",
        choices: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
      },
      {
        question: "How many continents are there?",
        choices: ["5", "6", "7", "8"],
        correct: 2,
      },
      {
        question: "What year did World War II end?",
        choices: ["1943", "1944", "1945", "1946"],
        correct: 2,
      },
      {
        question: "What is the chemical symbol for gold?",
        choices: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
      },
      {
        question: "Which country has the most population?",
        choices: ["USA", "India", "China", "Indonesia"],
        correct: 1,
      },
      {
        question: "What is the smallest country in the world?",
        choices: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        correct: 1,
      },
      {
        question: "Who painted the Mona Lisa?",
        choices: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"],
        correct: 2,
      },
      {
        question: "What is the hardest natural substance?",
        choices: ["Gold", "Iron", "Diamond", "Platinum"],
        correct: 2,
      },
      {
        question: "How many bones are in the adult human body?",
        choices: ["186", "206", "226", "246"],
        correct: 1,
      },
    ],
  };

  const questions = fallbacks.default;
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
