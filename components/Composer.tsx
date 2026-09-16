"use client";

import { useState } from "react";
import type { Category, Post } from "@/types/post";
import { CATEGORY_LABEL } from "@/types/post";
import { ensureAnonSession } from "@/lib/supabase/anonAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockCreatePost } from "@/lib/mock/store";

export default function Composer({
  category,
  onPosted,
}: {
  category: Category;
  onPosted: (post: Post) => void;
}) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    if (!getSupabaseBrowserClient()) {
      const post = mockCreatePost({
        category,
        content,
        image_url: category === "meme" ? imageUrl : null,
      });
      onPosted(post);
      setContent("");
      setImageUrl("");
      setSubmitting(false);
      return;
    }

    const token = await ensureAnonSession();
    if (!token) {
      setError("모브숲 접속 준비가 안 됐어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category,
        content,
        image_url: category === "meme" ? imageUrl : undefined,
      }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(body?.error ?? "글을 남기지 못했어요.");
      setSubmitting(false);
      return;
    }

    onPosted(body.post);
    setContent("");
    setImageUrl("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="sticker-card bg-canvas-pink p-5">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${CATEGORY_LABEL[category]} 이야기를 살짝 흘려두고 가세요…`}
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-2xl border-2 border-ink bg-surface p-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {category === "meme" && (
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="이미지 URL (선택)"
          className="mt-2 w-full rounded-full border-2 border-ink bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-ink-muted">
          작성자 닉네임은 등록할 때 자동으로 붙어요
        </span>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-full border-2 border-ink bg-accent px-4 py-1.5 font-display text-sm text-ink-on-accent transition active:scale-95 disabled:opacity-50"
        >
          {submitting ? "남기는 중…" : "살짝 흘리기"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-[#c23535]">{error}</p>}
    </form>
  );
}
