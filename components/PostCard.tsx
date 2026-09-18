"use client";

import { useState } from "react";
import Image from "next/image";
import type { Post } from "@/types/post";
import { isReportHidden } from "@/types/post";
import { CATEGORY_STYLE } from "@/lib/categoryStyles";
import { formatRelativeTime } from "@/lib/formatTime";
import ReactionBar from "./ReactionBar";
import ReportButton from "./ReportButton";
import DeleteButton from "./DeleteButton";
import EditPanel from "./EditPanel";

export default function PostCard({
  post,
  onDeleted,
  onEdited,
}: {
  post: Post;
  onDeleted: (postId: string) => void;
  onEdited: (
    postId: string,
    updates: { content: string; image_url: string | null }
  ) => void;
}) {
  const style = CATEGORY_STYLE[post.category];
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const hidden = isReportHidden(post) && !revealed;

  return (
    <article className="sticker-card p-5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1 font-display text-xs ${style.bg} ${style.text}`}
        >
          {style.emoji} {post.mob_nickname}
        </span>
        <time className="text-xs text-ink-muted">
          {formatRelativeTime(post.created_at)}
        </time>
      </div>

      {editing ? (
        <EditPanel
          postId={post.id}
          category={post.category}
          initialContent={post.content}
          initialImageUrl={post.image_url}
          onCancel={() => setEditing(false)}
          onSaved={(updates) => {
            onEdited(post.id, updates);
            setEditing(false);
          }}
        />
      ) : hidden ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-ink-muted px-3 py-4">
          <p className="text-sm text-ink-muted">신고가 누적된 글이에요</p>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="shrink-0 rounded-full border-2 border-ink bg-surface px-3 py-1 font-display text-xs active:scale-90"
          >
            보기
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {post.content}
          </p>

          {post.image_url && (
            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-2xl border-2 border-ink">
              <Image
                src={post.image_url}
                alt="첨부 이미지"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex items-center justify-between">
        <ReactionBar
          postId={post.id}
          initialLikes={post.reaction_count}
          initialDislikes={post.dislike_count}
        />
        <span className="flex items-center gap-3">
          {!editing && !hidden && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink-soft"
            >
              수정
            </button>
          )}
          <DeleteButton postId={post.id} onDeleted={onDeleted} />
          <ReportButton postId={post.id} />
        </span>
      </div>
    </article>
  );
}
