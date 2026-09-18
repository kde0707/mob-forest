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
  dislike_count: number;
  report_count: number;
  comment_count: number;
  created_at: string;
}

// posts 테이블 select 시 항상 이 컬럼만 지정한다.
// password_hash는 절대 클라이언트로 내려가면 안 되기 때문에 select("*")를 쓰지 않는다.
export const POST_COLUMNS =
  "id, category, content, image_url, mob_nickname, reaction_count, dislike_count, report_count, comment_count, created_at";

// 신고가 이 수치 이상 쌓이면 DB에서 지우거나 숨기지 않고, 화면에서만 접어서 보여준다.
export const REPORT_HIDE_THRESHOLD = 5;

export function isReportHidden(post: Pick<Post, "report_count">): boolean {
  return post.report_count >= REPORT_HIDE_THRESHOLD;
}
