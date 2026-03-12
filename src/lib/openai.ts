import OpenAI from "openai";
import { TriviaQuestion } from "@/types/game";

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export async function generateQuestions(
  theme: string,
  count: number,
  difficulty: string = "medium",
  language: string = "en"
): Promise<TriviaQuestion[]> {
  const difficultyGuide: Record<string, string> = {
    easy: "Make questions simple and straightforward, suitable for beginners or casual players. Use well-known facts that most people would know.",
    medium: "Make questions moderately challenging, requiring some general knowledge. Mix common and less common facts.",
    hard: "Make questions very challenging, requiring deep or specialized knowledge. Include tricky answer choices that are plausible but wrong.",
  };

  const languageInstruction = language === "fr"
    ? "Write ALL questions and ALL answer choices in French."
    : "Write all questions and answer choices in English.";

  const prompt = `Generate ${count} trivia questions about "${theme}".
Difficulty level: ${difficulty.toUpperCase()}.
${difficultyGuide[difficulty] || difficultyGuide.medium}
${languageInstruction}

Return a JSON array where each element has:
- "question": the trivia question (string)
- "choices": exactly 4 answer options (string array)
- "correct": the index (0-3) of the correct answer

Return ONLY the JSON array, no markdown or extra text.`;

  try {
    const response = await getClient().chat.completions.create({
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

export async function generateGuessHeadWords(
  theme: string,
  count: number,
  language: "fr" | "en" = "fr"
): Promise<string[]> {
  const langInstruction =
    language === "fr"
      ? "Les mots doivent être en FRANÇAIS, facilement prononçables en soirée."
      : "Words must be in ENGLISH, easy to pronounce at a party.";

  const prompt = `Tu génères des mots pour le jeu \"Devine Tête\" (phone-on-forehead party game).

Thème demandé: "${theme}".

Contraintes:
- Génère ${count} mots ou noms très courts (1 à 3 mots maximum).
- Mélange personnages, objets, concepts amusants liés au thème.
- Évite les choses trop obscures ou offensantes.
- ${langInstruction}

Format de sortie:
- Retourne UNIQUEMENT un tableau JSON de chaînes de caractères, par exemple:
  ["Harry Potter", "Zidane", "Pikachu"]`;

  try {
    const response = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un générateur de mots pour un jeu de soirée. Tu retournes UNIQUEMENT du JSON valide.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response from OpenAI");

    const cleaned = content.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const words = JSON.parse(cleaned) as string[];
    return words.filter((w) => typeof w === "string" && w.trim().length > 0);
  } catch (error) {
    console.error("OpenAI guess-head generation failed, using simple fallback:", error);
    // Fallback très simple si l'IA n'est pas dispo
    const fallback = [
      "Harry Potter",
      "Zidane",
      "Pikachu",
      "Batman",
      "Shrek",
      "Beyoncé",
      "Spider-Man",
      "Simba",
      "Barbie",
      "Joker",
      "Chat",
      "Chien",
      "Licorne",
    ];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(fallback[i % fallback.length] ?? `Mot ${i + 1}`);
    }
    return result;
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
