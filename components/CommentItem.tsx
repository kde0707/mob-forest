"use client";

import { useState } from "react";
import type { Comment } from "@/types/comment";
import { isReportHidden } from "@/types/post";
import { formatRelativeTime } from "@/lib/formatTime";
import CommentDeleteButton from "./CommentDeleteButton";
import CommentEditPanel from "./CommentEditPanel";
import CommentReportButton from "./CommentReportButton";

export default function CommentItem({
  comment,
  allowReply,
  isReplying,
  onToggleReply,
  onDeleted,
  onEdited,
}: {
  comment: Comment;
  allowReply: boolean;
  isReplying?: boolean;
  onToggleReply?: () => void;
  onDeleted: (commentId: string) => void;
  onEdited: (commentId: string, content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hidden = isReportHidden(comment) && !revealed;

  if (comment.deleted_at) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xs text-ink-muted">
            {comment.mob_nickname}
          </span>
          <time className="text-xs text-ink-muted">
            {formatRelativeTime(comment.created_at)}
          </time>
        </div>
        <p className="mt-1.5 text-sm italic text-ink-muted">
          삭제된 댓글입니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-xs text-ink-soft">
          {comment.mob_nickname}
        </span>
        <time className="text-xs text-ink-muted">
          {formatRelativeTime(comment.created_at)}
        </time>
      </div>

      {editing ? (
        <CommentEditPanel
          commentId={comment.id}
          initialContent={comment.content}
          onCancel={() => setEditing(false)}
          onSaved={(content) => {
            onEdited(comment.id, content);
            setEditing(false);
          }}
        />
      ) : hidden ? (
        <div className="mt-1.5 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-ink-muted px-3 py-2.5">
          <p className="text-xs text-ink-muted">신고가 누적된 댓글이에요</p>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="shrink-0 rounded-full border-2 border-ink bg-surface px-2.5 py-0.5 font-display text-xs active:scale-90"
          >
            보기
          </button>
        </div>
      ) : (
        <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">
          {comment.content}
        </p>
      )}

      {!editing && (
        <div className="mt-2 flex items-center gap-3">
          {allowReply && (
            <button
              type="button"
              onClick={onToggleReply}
              className="text-xs text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink-soft"
            >
              {isReplying ? "답글 취소" : "답글"}
            </button>
          )}
          {!hidden && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink-soft"
            >
              수정
            </button>
          )}
          <CommentDeleteButton commentId={comment.id} onDeleted={onDeleted} />
          <CommentReportButton commentId={comment.id} />
        </div>
      )}
    </div>
  );
}
