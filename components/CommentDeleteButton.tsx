"use client";

import { useState } from "react";
import { deleteComment } from "@/lib/commentActions";

export default function CommentDeleteButton({
  commentId,
  onDeleted,
}: {
  commentId: string;
  onDeleted: (commentId: string) => void;
}) {
  const [state, setState] = useState<"idle" | "confirm" | "pending">("idle");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setState("pending");
    setError(null);

    const result = await deleteComment(commentId, password);
    if (!result.ok) {
      setError(result.message);
      setState("confirm");
      return;
    }

    onDeleted(commentId);
  }

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={() => setState("confirm")}
        className="text-xs text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink-soft"
      >
        삭제
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        maxLength={30}
        autoComplete="off"
        className="w-24 rounded-full border-2 border-ink bg-surface px-2 py-0.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="button"
        onClick={handleConfirm}
        disabled={state === "pending" || password.length === 0}
        className="rounded-full border-2 border-ink bg-accent-soft px-2 py-0.5 font-display active:scale-90 disabled:opacity-50"
      >
        삭제
      </button>
      <button
        type="button"
        onClick={() => {
          setState("idle");
          setPassword("");
          setError(null);
        }}
        className="rounded-full border-2 border-ink bg-surface px-2 py-0.5 font-display active:scale-90"
      >
        취소
      </button>
      {error && <span className="text-[#c23535]">{error}</span>}
    </span>
  );
}
