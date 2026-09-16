import type { Category } from "@/types/post";

export const CATEGORY_STYLE: Record<
  Category,
  { bg: string; text: string; emoji: string }
> = {
  sighting: {
    bg: "bg-[var(--cat-sighting-bg)]",
    text: "text-[var(--cat-sighting)]",
    emoji: "👀",
  },
  chat: {
    bg: "bg-[var(--cat-chat-bg)]",
    text: "text-[var(--cat-chat)]",
    emoji: "💬",
  },
  meme: {
    bg: "bg-[var(--cat-meme-bg)]",
    text: "text-[var(--cat-meme)]",
    emoji: "🖼️",
  },
};
