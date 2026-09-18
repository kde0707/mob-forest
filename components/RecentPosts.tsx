"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import { mockListPosts } from "@/lib/mock/store";
import PostListItem from "./PostListItem";

export default function RecentPosts({
  initialPosts,
  configured,
}: {
  initialPosts: Post[];
  configured: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    if (!configured) {
      // localStorage는 서버에서 알 수 없는 클라이언트 전용 저장소라 마운트 시 동기화한다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosts(mockListPosts().slice(0, 6));
    }
  }, [configured]);

  if (posts.length === 0) {
    return (
      <p className="sticker-card p-6 text-center text-sm text-ink-muted">
        아직 아무 모브도 지나가지 않았어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </div>
  );
}
