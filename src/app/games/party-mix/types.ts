import type { PartyMixCategoryId } from "./data";

export interface PartyMixCurrentItem {
  categoryId: PartyMixCategoryId;
  label: string;
  emoji: string;
  instruction: string;
  text: string;
  /** Pour Truth or Dare : "Vérité" ou "Défi" */
  subType?: "truth" | "dare";
}
