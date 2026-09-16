"use client";

import { useState } from "react";
import { toggleReaction } from "@/lib/postActions";

const storageKey = (postId: string) => `mobforest:reacted:${postId}`;

function readReacted(postId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(storageKey(postId)) === "1";
}

export default function ReactionButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [reacted, setReacted] = useState(() => readReacted(postId));
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);

    const nextReacted = !reacted;
    setReacted(nextReacted);
    setCount((c) => c + (nextReacted ? 1 : -1));

    const result = await toggleReaction(postId, reacted);

    if (!result.ok) {
      setReacted(reacted);
      setCount((c) => c + (nextReacted ? -1 : 1));
    } else {
      window.localStorage.setItem(
        storageKey(postId),
        result.reacted ? "1" : "0"
      );
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-display text-xs transition active:scale-90 disabled:opacity-60 ${
        reacted ? "bg-accent text-ink-on-accent" : "bg-surface text-ink hover:bg-accent-soft"
      }`}
    >
      <span>{reacted ? "🐾" : "🐾"}</span>
      <span>공감</span>
      <span>{count}</span>
    </button>
  );
}
