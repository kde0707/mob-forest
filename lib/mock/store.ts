// Supabase 연결 전, 브라우저 localStorage만으로 동작하는 목업 데이터 저장소.
// 새로고침해도 남아있지만 다른 브라우저/기기와는 공유되지 않는다.
import type { Category, Post } from "@/types/post";
import { randomMobNickname } from "@/lib/mobNames";

const POSTS_KEY = "mobforest:mock:posts";
const NICKNAME_KEY = "mobforest:mock:nickname";
const reportedKey = (postId: string) => `mobforest:mock:reported:${postId}`;

// mock 모드에서도 세션(브라우저)당 닉네임 하나를 뽑아 저장하고 계속 재사용한다.
function getSessionNickname(): string {
  const existing = window.localStorage.getItem(NICKNAME_KEY);
  if (existing) return existing;
  const nickname = randomMobNickname();
  window.localStorage.setItem(NICKNAME_KEY, nickname);
  return nickname;
}

function readAll(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(POSTS_KEY);
    return raw ? (JSON.parse(raw) as Post[]) : [];
  } catch {
    return [];
  }
}

function writeAll(posts: Post[]) {
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function mockListPosts(category?: Category): Post[] {
  const posts = readAll().sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  return category ? posts.filter((p) => p.category === category) : posts;
}

export function mockCreatePost(input: {
  category: Category;
  content: string;
  image_url?: string | null;
}): Post {
  const post: Post = {
    id: crypto.randomUUID(),
    category: input.category,
    content: input.content,
    image_url: input.image_url ?? null,
    mob_nickname: getSessionNickname(),
    reaction_count: 0,
    dislike_count: 0,
    report_count: 0,
    created_at: new Date().toISOString(),
  };

  writeAll([post, ...readAll()]);
  return post;
}

type ReactionKind = "like" | "dislike";

export function mockSetReaction(
  postId: string,
  current: ReactionKind | null,
  next: ReactionKind | null
): { ok: boolean; reaction: ReactionKind | null } {
  const posts = readAll();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return { ok: false, reaction: current };

  const post = posts[index];
  let { reaction_count: likeCount, dislike_count: dislikeCount } = post;

  // 기존 반응 제거
  if (current === "like") likeCount = Math.max(0, likeCount - 1);
  if (current === "dislike") dislikeCount = Math.max(0, dislikeCount - 1);
  // 새 반응 반영
  if (next === "like") likeCount += 1;
  if (next === "dislike") dislikeCount += 1;

  posts[index] = {
    ...post,
    reaction_count: likeCount,
    dislike_count: dislikeCount,
  };
  writeAll(posts);
  return { ok: true, reaction: next };
}

export function mockReportPost(postId: string): {
  ok: boolean;
  message: string;
} {
  if (window.localStorage.getItem(reportedKey(postId)) === "1") {
    return { ok: false, message: "이미 신고했어요." };
  }

  const posts = readAll();
  const index = posts.findIndex((p) => p.id === postId);
  if (index !== -1) {
    posts[index] = { ...posts[index], report_count: posts[index].report_count + 1 };
    writeAll(posts);
  }

  window.localStorage.setItem(reportedKey(postId), "1");
  return { ok: true, message: "신고했어요. (목업 모드 — 실제 전송은 안 돼요)" };
}
