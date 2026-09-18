// Supabase 연결 전, 브라우저 localStorage만으로 동작하는 목업 데이터 저장소.
// 새로고침해도 남아있지만 다른 브라우저/기기와는 공유되지 않는다.
import type { Category, Post } from "@/types/post";
import type { Comment } from "@/types/comment";
import { randomMobNickname } from "@/lib/mobNames";
import { weekAgoIso } from "@/lib/formatTime";

const POSTS_KEY = "mobforest:mock:posts";
const COMMENTS_KEY = "mobforest:mock:comments";
const NICKNAME_KEY = "mobforest:mock:nickname";
const reportedKey = (postId: string) => `mobforest:mock:reported:${postId}`;
const passwordKey = (postId: string) => `mobforest:mock:pw:${postId}`;
const commentPasswordKey = (commentId: string) =>
  `mobforest:mock:comment-pw:${commentId}`;
const commentReportedKey = (commentId: string) =>
  `mobforest:mock:comment-reported:${commentId}`;

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

export function mockGetPost(id: string): Post | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function mockListTopPosts(limit: number, category?: Category): Post[] {
  const weekAgo = weekAgoIso();
  return readAll()
    .filter(
      (p) =>
        p.reaction_count > 0 &&
        p.created_at >= weekAgo &&
        (!category || p.category === category)
    )
    .sort(
      (a, b) =>
        b.reaction_count - a.reaction_count ||
        b.created_at.localeCompare(a.created_at)
    )
    .slice(0, limit);
}

export function mockCreatePost(input: {
  category: Category;
  content: string;
  image_url?: string | null;
  password: string;
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
    comment_count: 0,
    created_at: new Date().toISOString(),
  };

  writeAll([post, ...readAll()]);
  // 목업 모드는 이 브라우저 안에서만 도는 데모 데이터라 평문 저장으로 충분하다.
  window.localStorage.setItem(passwordKey(post.id), input.password);
  return post;
}

export function mockDeletePost(
  postId: string,
  password: string
): { ok: boolean; message: string } {
  const stored = window.localStorage.getItem(passwordKey(postId));
  if (stored === null || stored !== password) {
    return { ok: false, message: "비밀번호가 맞지 않아요." };
  }

  writeAll(readAll().filter((p) => p.id !== postId));
  window.localStorage.removeItem(passwordKey(postId));
  return { ok: true, message: "삭제했어요." };
}

export function mockEditPost(
  postId: string,
  password: string,
  content: string,
  imageUrl: string | null
): { ok: boolean; message: string } {
  const stored = window.localStorage.getItem(passwordKey(postId));
  if (stored === null || stored !== password) {
    return { ok: false, message: "비밀번호가 맞지 않아요." };
  }

  const posts = readAll();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) {
    return { ok: false, message: "글을 찾을 수 없어요." };
  }

  posts[index] = { ...posts[index], content, image_url: imageUrl };
  writeAll(posts);
  return { ok: true, message: "수정했어요." };
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

function readAllComments(): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMMENTS_KEY);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

function writeAllComments(comments: Comment[]) {
  window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function bumpCommentCount(postId: string, delta: number) {
  const posts = readAll();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return;
  posts[index] = {
    ...posts[index],
    comment_count: Math.max(0, posts[index].comment_count + delta),
  };
  writeAll(posts);
}

export function mockListComments(postId: string): Comment[] {
  return readAllComments()
    .filter((c) => c.post_id === postId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function mockCreateComment(
  postId: string,
  parentCommentId: string | null,
  content: string,
  password: string
): { ok: boolean; message: string; comment?: Comment } {
  const comment: Comment = {
    id: crypto.randomUUID(),
    post_id: postId,
    parent_comment_id: parentCommentId,
    content,
    mob_nickname: getSessionNickname(),
    report_count: 0,
    deleted_at: null,
    created_at: new Date().toISOString(),
  };

  writeAllComments([...readAllComments(), comment]);
  window.localStorage.setItem(commentPasswordKey(comment.id), password);
  bumpCommentCount(postId, 1);

  return { ok: true, message: "댓글을 남겼어요.", comment };
}

export function mockEditComment(
  commentId: string,
  password: string,
  content: string
): { ok: boolean; message: string } {
  const stored = window.localStorage.getItem(commentPasswordKey(commentId));
  if (stored === null || stored !== password) {
    return { ok: false, message: "비밀번호가 맞지 않아요." };
  }

  const comments = readAllComments();
  const index = comments.findIndex((c) => c.id === commentId);
  if (index === -1) {
    return { ok: false, message: "댓글을 찾을 수 없어요." };
  }

  comments[index] = { ...comments[index], content };
  writeAllComments(comments);
  return { ok: true, message: "수정했어요." };
}

export function mockDeleteComment(
  commentId: string,
  password: string
): { ok: boolean; message: string } {
  const stored = window.localStorage.getItem(commentPasswordKey(commentId));
  if (stored === null || stored !== password) {
    return { ok: false, message: "비밀번호가 맞지 않아요." };
  }

  const comments = readAllComments();
  const index = comments.findIndex((c) => c.id === commentId);
  if (index === -1) {
    return { ok: false, message: "댓글을 찾을 수 없어요." };
  }

  // 소프트 삭제: 답글이 그대로 남도록 실제로 지우지 않고 표시만 바꾼다.
  comments[index] = {
    ...comments[index],
    content: "",
    deleted_at: new Date().toISOString(),
  };
  writeAllComments(comments);

  return { ok: true, message: "삭제했어요." };
}

export function mockReportComment(commentId: string): {
  ok: boolean;
  message: string;
} {
  if (window.localStorage.getItem(commentReportedKey(commentId)) === "1") {
    return { ok: false, message: "이미 신고했어요." };
  }

  const comments = readAllComments();
  const index = comments.findIndex((c) => c.id === commentId);
  if (index !== -1) {
    comments[index] = {
      ...comments[index],
      report_count: comments[index].report_count + 1,
    };
    writeAllComments(comments);
  }

  window.localStorage.setItem(commentReportedKey(commentId), "1");
  return { ok: true, message: "신고했어요. (목업 모드 — 실제 전송은 안 돼요)" };
}
