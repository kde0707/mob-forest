"use client";

import { useState } from "react";
import { editComment } from "@/lib/commentActions";

export default function CommentEditPanel({
  commentId,
  initialContent,
  onCancel,
  onSaved,
}: {
  commentId: string;
  initialContent: string;
  onCancel: () => void;
  onSaved: (content: string) => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await editComment(commentId, password, content.trim());

    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    onSaved(content.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1.5 flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-2xl border-2 border-ink bg-surface p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div className="flex items-center gap-1.5">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          maxLength={30}
          autoComplete="off"
          className="w-28 rounded-full border-2 border-ink bg-surface px-2 py-1 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim() || password.length === 0}
          className="rounded-full border-2 border-ink bg-accent-soft px-3 py-1 font-display text-xs active:scale-90 disabled:opacity-50"
        >
          {submitting ? "저장 중…" : "저장"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border-2 border-ink bg-surface px-3 py-1 font-display text-xs active:scale-90"
        >
          취소
        </button>
      </div>
      {error && <p className="text-xs text-[#c23535]">{error}</p>}
    </form>
  );
}
