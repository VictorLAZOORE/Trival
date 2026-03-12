export interface GuessHeadTheme {
  id: string;
  label: string;
  description: string;
  emoji: string;
  words: string[];
}

export const PRESET_THEMES: GuessHeadTheme[] = [
  {
    id: "celebrities",
    label: "Célébrités",
    description: "Acteurs, chanteurs, personnalités connues",
    emoji: "⭐️",
    words: [
      "Beyoncé",
      "Rihanna",
      "Drake",
      "Taylor Swift",
      "Zidane",
      "Mbappé",
      "Angelina Jolie",
      "Brad Pitt",
      "Leonardo DiCaprio",
      "Lady Gaga",
      "Ariana Grande",
      "Elon Musk",
      "Kim Kardashian",
      "Miley Cyrus",
      "The Rock",
      "Will Smith",
      "Johnny Depp",
      "Emma Watson",
      "Harry Styles",
      "Ed Sheeran",
    ],
  },
  {
    id: "movies",
    label: "Films & séries",
    description: "Personnages de films et séries connus",
    emoji: "🎬",
    words: [
      "Harry Potter",
      "Darth Vader",
      "Iron Man",
      "Spider-Man",
      "Sherlock Holmes",
      "James Bond",
      "Daenerys Targaryen",
      "Jon Snow",
      "Walter White",
      "Yoda",
      "Luke Skywalker",
      "Batman",
      "Joker",
      "Wonder Woman",
      "Naruto",
      "Goku",
      "Simba",
      "Shrek",
      "Elsa",
      "Indiana Jones",
    ],
  },
  {
    id: "jobs",
    label: "Métiers",
    description: "Professions et rôles du quotidien",
    emoji: "💼",
    words: [
      "Pompier",
      "Médecin",
      "Professeur",
      "Serveur",
      "Avocat",
      "Policier",
      "Pilote d'avion",
      "Influenceur",
      "Journaliste",
      "Coach sportif",
      "Infirmier",
      "Chanteur",
      "Acteur",
      "Développeur",
      "Designer",
      "Cuisinier",
      "Photographe",
      "Architecte",
      "Dentiste",
      "Youtuber",
    ],
  },
  {
    id: "animals",
    label: "Animaux",
    description: "Animaux mignons, rigolos ou dangereux",
    emoji: "🐾",
    words: [
      "Chat",
      "Chien",
      "Lion",
      "Tigre",
      "Girafe",
      "Panda",
      "Koala",
      "Croco",
      "Dauphin",
      "Pingouin",
      "Hérisson",
      "Poule",
      "Loup",
      "Singe",
      "Éléphant",
      "Requin",
      "Poney",
      "Ours",
      "Renard",
      "Lama",
    ],
  },
];

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickWordsForPlayers(
  baseWords: string[],
  playerCount: number
): string[] {
  if (playerCount <= 0) return [];
  const shuffled = shuffle(baseWords);
  if (shuffled.length >= playerCount) {
    return shuffled.slice(0, playerCount);
  }
  // Si pas assez de mots, on réutilise en bouclant
  const result: string[] = [];
  let i = 0;
  while (result.length < playerCount) {
    result.push(shuffled[i % shuffled.length] ?? `Mot ${result.length + 1}`);
    i++;
  }
  return result;
}

