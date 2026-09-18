"use client";

import { useEffect, useState } from "react";
import type { Comment } from "@/types/comment";
import { mockListComments } from "@/lib/mock/store";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";

export default function CommentSection({
  postId,
  initialComments,
  configured,
}: {
  postId: string;
  initialComments: Comment[];
  configured: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    // mock 모드에서는 서버가 localStorage를 알 수 없어 클라이언트에서 조회한다.
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComments(mockListComments(postId));
    }
  }, [configured, postId]);

  const topLevel = comments
    .filter((c) => !c.parent_comment_id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  function repliesOf(commentId: string) {
    return comments
      .filter((c) => c.parent_comment_id === commentId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  function handleDeleted(commentId: string) {
    // 소프트 삭제라 목록에서 지우지 않고 "삭제된 댓글입니다"로만 바꾼다 —
    // 답글이 달려있어도 스레드가 끊기지 않는다.
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content: "", deleted_at: new Date().toISOString() }
          : c
      )
    );
  }

  function handleEdited(commentId: string, content: string) {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content } : c))
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h2 className="font-display text-sm text-ink-soft">
        댓글 {comments.length}
      </h2>

      <CommentComposer
        postId={postId}
        onPosted={(comment) => setComments((prev) => [...prev, comment])}
      />

      <div className="flex flex-col gap-3">
        {topLevel.length === 0 && (
          <p className="text-sm text-ink-muted">아직 댓글이 없어요.</p>
        )}

        {topLevel.map((comment) => (
          <div key={comment.id} className="sticker-card p-3">
            <CommentItem
              comment={comment}
              allowReply
              isReplying={replyTo === comment.id}
              onToggleReply={() =>
                setReplyTo((prev) => (prev === comment.id ? null : comment.id))
              }
              onDeleted={handleDeleted}
              onEdited={handleEdited}
            />

            {replyTo === comment.id && (
              <div className="mt-3 pl-3">
                <CommentComposer
                  postId={postId}
                  parentCommentId={comment.id}
                  placeholder="답글을 남겨보세요…"
                  onPosted={(reply) => {
                    setComments((prev) => [...prev, reply]);
                    setReplyTo(null);
                  }}
                  onCancel={() => setReplyTo(null)}
                />
              </div>
            )}

            {repliesOf(comment.id).length > 0 && (
              <div className="mt-3 flex flex-col gap-3 border-l-2 border-dashed border-ink-muted pl-3">
                {repliesOf(comment.id).map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    allowReply={false}
                    onDeleted={handleDeleted}
                    onEdited={handleEdited}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
