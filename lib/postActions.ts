import { getSupabaseBrowserClient } from "./supabase/client";
import { ensureAnonSession } from "./supabase/anonAuth";
import { mockReportPost, mockToggleReaction } from "./mock/store";

export async function toggleReaction(
  postId: string,
  isReacted: boolean
): Promise<{ ok: boolean; reacted: boolean }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockToggleReaction(postId, isReacted);

  const token = await ensureAnonSession();
  if (!token) return { ok: false, reacted: isReacted };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reacted: isReacted };

  if (isReacted) {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("post_id", postId)
      .eq("author_id", user.id);
    return { ok: !error, reacted: error ? true : false };
  }

  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId });
  return { ok: !error, reacted: !error };
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
