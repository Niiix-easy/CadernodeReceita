export type Category = "food" | "health" | "soap";

export interface CatalogItem {
  id: string;
  category: Category;
  title: string;
  level: string | null;
  time: string | null;
  verified?: boolean;
}

export interface Nutrition {
  protein?: string | number;
  prot?: string | number;
  fats?: string | number;
  fat?: string | number;
  carbs?: string | number;
  carb?: string | number;
}

export interface Item extends CatalogItem {
  servings: string | null;
  summary: string | null;
  ingredients: string[];
  steps: string[];
  safety: boolean;
  video_id: string | null;
  channel_url: string | null;
  source_url: string | null;
  note: string | null;
  nutrition?: Nutrition;
}

export type SubStatus = "none" | "pending" | "authorized" | "paused" | "cancelled";

export interface Subscription {
  status: SubStatus;
  next_payment_date: string | null;
  access_until: string | null;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  food: "Recipes",
  health: "Health Tips",
  soap: "Handmade Soap",
};

export const SAFETY_TEXT =
  "Use luvas de borracha, óculos de proteção e avental/manga longa; trabalhe em local ventilado. " +
  "Adicione sempre a soda à água, nunca o contrário. Use apenas utensílios de inox, plástico resistente ou vidro " +
  "(nunca alumínio) e não os reutilize para comida. Mantenha longe de crianças e animais. " +
  "Contato com a pele ou olhos: lave com água corrente abundante por vários minutos e procure atendimento de saúde.";
