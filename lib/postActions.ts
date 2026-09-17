import { getSupabaseBrowserClient } from "./supabase/client";
import { ensureAnonSession } from "./supabase/anonAuth";
import { mockReportPost, mockSetReaction } from "./mock/store";

export type ReactionKind = "like" | "dislike";

// 글 하나에 대한 내 반응을 current에서 next로 바꾼다.
// next가 null이면 반응 취소, current와 next가 다르면 공감<->비추 전환.
export async function setReaction(
  postId: string,
  current: ReactionKind | null,
  next: ReactionKind | null
): Promise<{ ok: boolean; reaction: ReactionKind | null }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockSetReaction(postId, current, next);

  const token = await ensureAnonSession();
  if (!token) return { ok: false, reaction: current };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reaction: current };

  // 취소: 기존 반응 삭제
  if (next === null) {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("post_id", postId)
      .eq("author_id", user.id);
    return { ok: !error, reaction: error ? current : null };
  }

  // 전환: 공감 <-> 비추 (unique 제약 때문에 kind만 업데이트)
  if (current !== null) {
    const { error } = await supabase
      .from("reactions")
      .update({ kind: next })
      .eq("post_id", postId)
      .eq("author_id", user.id);
    return { ok: !error, reaction: error ? current : next };
  }

  // 신규: 반응 추가
  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId, kind: next });
  return { ok: !error, reaction: error ? current : next };
}

export async function reportPost(
  postId: string,
  reason?: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockReportPost(postId);

  const token = await ensureAnonSession();
  if (!token) {
    return { ok: false, message: "지금은 신고할 수 없어요." };
  }

  const { error } = await supabase
    .from("reports")
    .insert({ post_id: postId, reason: reason ?? null });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "이미 신고했어요." };
    }
    return { ok: false, message: "신고에 실패했어요." };
  }

  return { ok: true, message: "신고했어요. 확인할게요." };
}
