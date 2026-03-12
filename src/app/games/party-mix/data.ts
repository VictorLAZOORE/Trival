/**
 * Données Party Mix — extensible : ajouter des lignes dans chaque tableau.
 */

export type PartyMixCategoryId =
  | "never_have_i_ever"
  | "truth_or_dare"
  | "most_likely"
  | "challenge";

export interface  PartyMixCategoryConfig {
  id: PartyMixCategoryId;
  label: string;
  shortLabel: string;
  emoji: string;
  instruction: string;
}

export const PARTY_MIX_CATEGORIES: PartyMixCategoryConfig[] = [
  {
    id: "never_have_i_ever",
    label: "Je n'ai jamais",
    shortLabel: "Je n'ai jamais",
    emoji: "🙊",
    instruction: "Tu bois si tu l'as déjà fait.",
  },
  {
    id: "truth_or_dare",
    label: "Action ou Vérité",
    shortLabel: "Vérité ou Défi",
    emoji: "🎲",
    instruction: "Refuse → tu bois.",
  },
  {
    id: "most_likely",
    label: "Le plus susceptible de…",
    shortLabel: "Le plus susceptible",
    emoji: "🤔",
    instruction: "Tu bois si tu te sens concerné.",
  },
  {
    id: "challenge",
    label: "Défi",
    shortLabel: "Défi",
    emoji: "🔥",
    instruction: "Échoue → tu bois.",
  },
];

/** Je n'ai jamais — phrase complète "Je n'ai jamais …" */
export const NEVER_HAVE_I_EVER: string[] = [
  "menti pour éviter une soirée",
  "envoyé un message à la mauvaise personne",
  "pleuré devant un film Disney",
  "dansé seul chez moi en slip",
  "mangé quelque chose tombé par terre (règle des 5 secondes)",
  "fait semblant d'être au tel pour fuir quelqu'un",
  "oublié le prénom de quelqu'un en pleine conversation",
  "stalké un ex sur les réseaux",
  "chanté sous la douche comme si j'étais en concert",
  "triché à un jeu de société",
  "envoyé un vocal en état pas net",
  "rêvé de quelqu'un de la pièce",
  "fait pipi dans la piscine",
  "critiqué un pote dans son dos",
  "regardé une série en avance sans attendre les autres",
  "utilisé le téléphone des toilettes en soirée",
  "fait un doigt d'honneur à un inconnu (en voiture)",
  "pleuré pour un animal dans un film",
  "mangé un truc périmé par flemme",
  "dit « je pars » sans vraiment partir pendant 30 min",
];

/** Vérité — questions personnelles */
export const TRUTH: string[] = [
  "Quelle est la chose la plus gênante que tu aies faite en soirée ?",
  "Qui est ton crush secret dans cette pièce ?",
  "Quel est ton plus gros regret avec un ex ?",
  "Quelle chanson tu écoutes en boucle quand tu es seul ?",
  "Quelle est la pire chose que tu aies dite derrière le dos de quelqu'un ici ?",
  "Quel est ton fantasme le plus bizarre ?",
  "À quel âge as-tu eu ton premier baiser ?",
  "Quelle est la chose la plus illégale que tu aies faite ?",
  "Qui ici t'a déjà énervé et tu ne lui as jamais dit ?",
  "Quel est ton plus gros complexe ?",
  "Quelle habitude tu caches à tout le monde ?",
  "Qui est la dernière personne à qui tu as pensé avant de dormir ?",
  "Quel secret tu n'as jamais dit à tes parents ?",
  "Quelle est ta plus grosse honte sur les réseaux ?",
  "Si tu devais embrasser quelqu'un ici, ce serait qui ?",
];

/** Défi (Action) — défis à réaliser */
export const DARE: string[] = [
  "Fais un compliment à chaque personne de la pièce à tour de rôle.",
  "Envoie un vocal à ton dernier contact en disant « je t'aime ».",
  "Mange une cuillère de moutarde / piment sans faire la grimace.",
  "Fais 10 pompes (ou 20 secondes de gainage).",
  "Chante une chanson de ton choix a cappella pendant 30 secondes.",
  "Fais une déclaration d'amour à un objet de la pièce.",
  "Imite quelqu'un de la pièce jusqu'à ce qu'on devine qui c'est.",
  "Mets un glaçon dans ton dos jusqu'à ce qu'il fonde.",
  "Fais le cri de Tarzan 3 fois par la fenêtre (ou vers l'extérieur).",
  "Décris ta vie en 3 mots, façon poésie dramatique.",
  "Fais une danse de 30 secondes sans musique.",
  "Appelle quelqu'un et chante « Joyeux anniversaire » (même si ce n'est pas son anniversaire).",
  "Mange un aliment les yeux bandés qu'on te tend.",
  "Fais une phrase en ne disant que des mots qui commencent par la même lettre.",
  "Fais le poirier (ou tiens la position 10 secondes contre un mur).",
];

/** Le plus susceptible de… */
export const MOST_LIKELY: string[] = [
  "oublier le nom de quelqu'un 2 secondes après l'avoir entendu",
  "envoyer un message à 3h du matin et le regretter",
  "pleurer devant une pub",
  "manger les restes dans le frigo des autres",
  "s'endormir en soirée le premier",
  "dire « je pars » 5 fois avant de vraiment partir",
  "avoir déjà stalké tout le monde dans la pièce",
  "répondre « ça va » alors que non",
  "oublier un anniversaire important",
  "envoyer un message à la mauvaise personne",
  "faire une crise de fou rire au mauvais moment",
  "s'être déjà perdu en allant aux toilettes en soirée",
  "avoir déjà triché à un jeu",
  "être le dernier à quitter la soirée",
  "avoir déjà menti pour ne pas sortir",
  "pleurer en regardant un documentaire animalier",
  "avoir déjà dit du mal de quelqu'un ici",
  "être le plus susceptible de finir sa bouteille tout seul",
  "s'endormir pendant un film",
  "avoir un crush secret sur quelqu'un ici",
];

/** Défis / Dare challenges — échoue = tu bois */
export const CHALLENGES: string[] = [
  "Reste 1 minute sans regarder ton téléphone.",
  "Récite l'alphabet à l'envers en moins de 30 secondes.",
  "Dis « je ne bois pas » 10 fois de suite sans te tromper.",
  "Tiens en équilibre sur un pied 45 secondes les yeux fermés.",
  "Répète tout ce que dit la personne à ta gauche pendant 1 tour.",
  "Fais 3 vœux à voix haute sans rire.",
  "Compte à l'envers de 87 à 73 en 15 secondes.",
  "Dis le prénom de tout le monde dans la pièce sans te tromper.",
  "Chante les 5 premières secondes de 3 chansons différentes.",
  "Fais un compliment sincère à chaque personne en 1 phrase.",
  "Reste 30 secondes sans cligner des yeux.",
  "Récite une phrase qu'on te donne, 3 fois de suite sans erreur.",
  "Touche ton nez avec ta langue (ou tiens 20 sec en essayant).",
  "Fais deviner un film en le décrivant en 3 mots max.",
  "Dis 5 mots qui n'ont rien à voir entre eux sans réfléchir.",
  "Garde un glaçon dans ta main jusqu'à ce qu'il fonde.",
  "Fais un bruit d'animal différent à chaque personne qui te le demande pendant 1 tour.",
  "Reste 1 minute sans sourire.",
  "Épelle ton prénom à l'envers en moins de 10 secondes.",
  "Raconte une blague (même nulle). Si personne ne rit, tu bois quand même.",
];

export const PARTY_MIX_DATA: Record<PartyMixCategoryId, string[]> = {
  never_have_i_ever: NEVER_HAVE_I_EVER,
  truth_or_dare: [...TRUTH, ...DARE],
  most_likely: MOST_LIKELY,
  challenge: CHALLENGES,
};

/** Pour Truth or Dare, on peut distinguer vérité vs défi à l'affichage (optionnel). */
export const TRUTH_OR_DARE_ITEMS: { type: "truth" | "dare"; text: string }[] = [
  ...TRUTH.map((text) => ({ type: "truth" as const, text })),
  ...DARE.map((text) => ({ type: "dare" as const, text })),
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function getRandomCategory(): PartyMixCategoryId {
  return pick(
    PARTY_MIX_CATEGORIES.map((c) => c.id)
  ) as PartyMixCategoryId;
}

export function getRandomItemForCategory(
  categoryId: PartyMixCategoryId
): { text: string; subType?: "truth" | "dare" } {
  if (categoryId === "truth_or_dare") {
    const item = pick(TRUTH_OR_DARE_ITEMS);
    return { text: item.text, subType: item.type };
  }
  const list = PARTY_MIX_DATA[categoryId];
  return { text: pick(list) };
}
