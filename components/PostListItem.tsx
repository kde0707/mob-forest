import Link from "next/link";
import type { Post } from "@/types/post";
import { CATEGORY_STYLE } from "@/lib/categoryStyles";
import { formatRelativeTime } from "@/lib/formatTime";

const PREVIEW_LENGTH = 48;

function previewOf(content: string): string {
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length > PREVIEW_LENGTH
    ? `${oneLine.slice(0, PREVIEW_LENGTH)}…`
    : oneLine;
}

export default function PostListItem({ post }: { post: Post }) {
  const style = CATEGORY_STYLE[post.category];

  return (
    <Link
      href={`/post/${post.category}/${post.id}`}
      className="sticker-card flex items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`shrink-0 text-lg ${style.text}`}>{style.emoji}</span>
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{previewOf(post.content)}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {post.mob_nickname} · {formatRelativeTime(post.created_at)}
          </p>
        </div>
      </div>
      <span className="shrink-0 font-display text-xs text-ink-soft">
        🐾 {post.reaction_count}
      </span>
    </Link>
  );
}
