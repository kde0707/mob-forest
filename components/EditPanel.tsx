"use client";

import { useState } from "react";
import type { Category } from "@/types/post";
import { editPost } from "@/lib/postActions";

export default function EditPanel({
  postId,
  category,
  initialContent,
  initialImageUrl,
  onCancel,
  onSaved,
}: {
  postId: string;
  category: Category;
  initialContent: string;
  initialImageUrl: string | null;
  onCancel: () => void;
  onSaved: (updates: { content: string; image_url: string | null }) => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const nextImageUrl = category === "meme" ? imageUrl.trim() || null : null;
    const result = await editPost(postId, password, content.trim(), nextImageUrl);

    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    onSaved({ content: content.trim(), image_url: nextImageUrl });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-ink-muted p-3"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-2xl border-2 border-ink bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {category === "meme" && (
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="이미지 URL (선택)"
          className="w-full rounded-full border-2 border-ink bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      )}

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
