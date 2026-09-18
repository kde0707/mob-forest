import { getSupabaseBrowserClient } from "./supabase/client";
import { ensureAnonSession } from "./supabase/anonAuth";
import {
  mockCreateComment,
  mockDeleteComment,
  mockEditComment,
  mockReportComment,
} from "./mock/store";
import type { Comment } from "@/types/comment";

export async function createComment(
  postId: string,
  parentCommentId: string | null,
  content: string,
  password: string
): Promise<{ ok: boolean; message: string; comment?: Comment }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return mockCreateComment(postId, parentCommentId, content, password);
  }

  const token = await ensureAnonSession();
  if (!token) {
    return { ok: false, message: "지금은 댓글을 남길 수 없어요." };
  }

  const res = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      post_id: postId,
      parent_comment_id: parentCommentId,
      content,
      password,
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, message: body?.error ?? "댓글을 남기지 못했어요." };
  }

  return { ok: true, message: "댓글을 남겼어요.", comment: body.comment };
}

export async function deleteComment(
  commentId: string,
  password: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockDeleteComment(commentId, password);

  const { data, error } = await supabase.rpc("delete_comment_with_password", {
    comment_id: commentId,
    password,
  });

  if (error) {
    return { ok: false, message: "삭제에 실패했어요." };
  }

  if (!data) {
    return { ok: false, message: "비밀번호가 맞지 않아요." };
  }

  return { ok: true, message: "삭제했어요." };
}

export async function editComment(
  commentId: string,
  password: string,
  content: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockEditComment(commentId, password, content);

  const { data, error } = await supabase.rpc("update_comment_with_password", {
    comment_id: commentId,
    password,
    new_content: content,
  });

  if (error) {
    return { ok: false, message: "수정에 실패했어요." };
  }

  if (!data) {
    return { ok: false, message: "비밀번호가 맞지 않아요." };
  }

  return { ok: true, message: "수정했어요." };
}

export async function reportComment(
  commentId: string,
  reason?: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockReportComment(commentId);

  const token = await ensureAnonSession();
  if (!token) {
    return { ok: false, message: "지금은 신고할 수 없어요." };
  }

  const { error } = await supabase
    .from("comment_reports")
    .insert({ comment_id: commentId, reason: reason ?? null });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "이미 신고했어요." };
    }
    return { ok: false, message: "신고에 실패했어요." };
  }

  return { ok: true, message: "신고했어요. 확인할게요." };
}
