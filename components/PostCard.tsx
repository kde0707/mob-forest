import Image from "next/image";
import type { Post } from "@/types/post";
import { CATEGORY_STYLE } from "@/lib/categoryStyles";
import { formatRelativeTime } from "@/lib/formatTime";
import ReactionBar from "./ReactionBar";
import ReportButton from "./ReportButton";
import DeleteButton from "./DeleteButton";

export default function PostCard({
  post,
  onDeleted,
}: {
  post: Post;
  onDeleted: (postId: string) => void;
}) {
  const style = CATEGORY_STYLE[post.category];

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

      <div className="mt-4 flex items-center justify-between">
        <ReactionBar
          postId={post.id}
          initialLikes={post.reaction_count}
          initialDislikes={post.dislike_count}
        />
        <span className="flex items-center gap-3">
          <DeleteButton postId={post.id} onDeleted={onDeleted} />
          <ReportButton postId={post.id} />
        </span>
      </div>
    </article>
  );
}
