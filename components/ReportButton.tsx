"use client";

import { useState } from "react";
import { reportPost } from "@/lib/postActions";

export default function ReportButton({ postId }: { postId: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleConfirm() {
    const result = await reportPost(postId);
    setMessage(result.message);
    setState("done");
  }

  if (state === "done") {
    return <span className="text-xs text-ink-muted">{message}</span>;
  }

  if (state === "confirm") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="text-ink-soft">신고할까요?</span>
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-full border-2 border-ink bg-accent-soft px-2 py-0.5 font-display active:scale-90"
        >
          네
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="rounded-full border-2 border-ink bg-surface px-2 py-0.5 font-display active:scale-90"
        >
          아니요
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setState("confirm")}
      className="text-xs text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink-soft"
    >
      신고
    </button>
  );
}
