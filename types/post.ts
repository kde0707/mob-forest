export const CATEGORIES = ["sighting", "chat", "meme"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  sighting: "목격담",
  chat: "잡담",
  meme: "짤·밈",
};

export const CATEGORY_DESCRIPTION: Record<Category, string> = {
  sighting: "숲 어딘가에서 본 모브 이야기를 흘려두고 가세요",
  chat: "그냥 아무 말이나 몽글몽글 흘려보내는 곳",
  meme: "웃긴 짤이랑 밈은 여기에 슬쩍",
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export interface Post {
  id: string;
  category: Category;
  content: string;
  image_url: string | null;
  mob_nickname: string;
  reaction_count: number;
  report_count: number;
  created_at: string;
}
