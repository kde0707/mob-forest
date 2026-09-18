"use client";

import { useState } from "react";
import { createComment } from "@/lib/commentActions";
import type { Comment } from "@/types/comment";

export default function CommentComposer({
  postId,
  parentCommentId = null,
  placeholder = "댓글을 남겨보세요…",
  onPosted,
  onCancel,
}: {
  postId: string;
  parentCommentId?: string | null;
  placeholder?: string;
  onPosted: (comment: Comment) => void;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    if (password.length < 4 || password.length > 30) {
      setError("삭제 비밀번호는 4~30자로 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createComment(
      postId,
      parentCommentId,
      content.trim(),
      password
    );

    if (!result.ok || !result.comment) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    onPosted(result.comment);
    setContent("");
    setPassword("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-2xl border-2 border-ink bg-surface p-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div className="flex items-center gap-1.5">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="삭제용 비밀번호"
          maxLength={30}
          autoComplete="new-password"
          className="w-32 rounded-full border-2 border-ink bg-surface px-2 py-1 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-full border-2 border-ink bg-accent px-3 py-1 font-display text-xs text-ink-on-accent transition active:scale-90 disabled:opacity-50"
        >
          {submitting ? "남기는 중…" : "남기기"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-ink bg-surface px-3 py-1 font-display text-xs active:scale-90"
          >
            취소
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#c23535]">{error}</p>}
    </form>
  );
}
