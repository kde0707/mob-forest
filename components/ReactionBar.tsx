"use client";

import { useState } from "react";
import { setReaction, type ReactionKind } from "@/lib/postActions";

const storageKey = (postId: string) => `mobforest:reaction:${postId}`;

function readReaction(postId: string): ReactionKind | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(storageKey(postId));
  if (value === "like" || value === "dislike") return value;
  // 이전 버전(공감 boolean) 키 마이그레이션
  if (window.localStorage.getItem(`mobforest:reacted:${postId}`) === "1") {
    return "like";
  }
  return null;
}

// from 반응을 to 반응으로 바꿀 때 특정 kind 카운터의 증감량
function delta(
  from: ReactionKind | null,
  to: ReactionKind | null,
  kind: ReactionKind
): number {
  return (to === kind ? 1 : 0) - (from === kind ? 1 : 0);
}

export default function ReactionBar({
  postId,
  initialLikes,
  initialDislikes,
}: {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
}) {
  const [mine, setMine] = useState<ReactionKind | null>(() =>
    readReaction(postId)
  );
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [pending, setPending] = useState(false);

  function applyCounts(from: ReactionKind | null, to: ReactionKind | null) {
    setLikes((c) => c + delta(from, to, "like"));
    setDislikes((c) => c + delta(from, to, "dislike"));
  }

  async function vote(kind: ReactionKind) {
    if (pending) return;
    setPending(true);

    const prev = mine;
    const next = mine === kind ? null : kind;

    // 낙관적 업데이트
    applyCounts(prev, next);
    setMine(next);

    const result = await setReaction(postId, prev, next);

    if (!result.ok) {
      // 실패 시 롤백
      applyCounts(next, prev);
      setMine(prev);
    } else if (result.reaction) {
      window.localStorage.setItem(storageKey(postId), result.reaction);
    } else {
      window.localStorage.removeItem(storageKey(postId));
    }

    setPending(false);
  }

  const baseClass =
    "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-display text-xs transition active:scale-90 disabled:opacity-60";

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => vote("like")}
        disabled={pending}
        className={`${baseClass} ${
          mine === "like"
            ? "bg-accent text-ink-on-accent"
            : "bg-surface text-ink hover:bg-accent-soft"
        }`}
      >
        <span>🐾</span>
        <span>공감</span>
        <span>{likes}</span>
      </button>

      <button
        type="button"
        onClick={() => vote("dislike")}
        disabled={pending}
        className={`${baseClass} ${
          mine === "dislike"
            ? "bg-ink text-surface"
            : "bg-surface text-ink-muted hover:bg-accent-soft"
        }`}
      >
        <span>💧</span>
        <span>비추</span>
        <span>{dislikes}</span>
      </button>
    </div>
  );
}
