"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Category, Post } from "@/types/post";
import { mockGetPost } from "@/lib/mock/store";
import PostCard from "./PostCard";

export default function PostDetailClient({
  category,
  postId,
  initialPost,
  configured,
}: {
  category: Category;
  postId: string;
  initialPost: Post | null;
  configured: boolean;
}) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [loaded, setLoaded] = useState(configured);

  useEffect(() => {
    // mock 모드에서는 서버가 localStorage를 알 수 없어 클라이언트에서 조회한다.
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPost(mockGetPost(postId));
      setLoaded(true);
    }
  }, [configured, postId]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link
        href={`/post/${category}`}
        className="text-sm text-ink-soft underline decoration-dotted underline-offset-2 hover:text-ink"
      >
        ← 목록으로
      </Link>

      <div className="mt-4">
        {!loaded && (
          <p className="py-10 text-center text-sm text-ink-muted">불러오는 중…</p>
        )}
        {loaded && !post && (
          <p className="py-10 text-center text-sm text-ink-muted">
            글을 찾을 수 없어요. 삭제됐거나 잘못된 링크예요.
          </p>
        )}
        {post && (
          <PostCard post={post} onDeleted={() => router.push(`/post/${category}`)} />
        )}
      </div>
    </div>
  );
}
