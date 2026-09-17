"use client";

import { useEffect, useState } from "react";
import type { Category, Post } from "@/types/post";
import { CATEGORY_DESCRIPTION, CATEGORY_LABEL } from "@/types/post";
import { CATEGORY_STYLE } from "@/lib/categoryStyles";
import { mockListPosts } from "@/lib/mock/store";
import Composer from "./Composer";
import PostCard from "./PostCard";

export default function BoardClient({
  category,
  initialPosts,
  configured,
}: {
  category: Category;
  initialPosts: Post[];
  configured: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const style = CATEGORY_STYLE[category];

  useEffect(() => {
    // localStorage는 서버에서 알 수 없는 순수 클라이언트 전용 저장소라
    // 마운트 시점에 한 번 동기화해야 한다.
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosts(mockListPosts(category));
    }
  }, [category, configured]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <header className={`sticker-card mb-6 p-6 ${style.bg}`}>
        <h1 className={`font-display text-3xl ${style.text}`}>
          {style.emoji} {CATEGORY_LABEL[category]}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {CATEGORY_DESCRIPTION[category]}
        </p>
      </header>

      {!configured && (
        <div className="sticker-card mb-4 bg-yellow-soft px-4 py-2 text-xs text-ink-soft">
          🧪 목업 모드로 동작 중이에요 — 이 브라우저에만 저장되고 다른 사람에겐
          안 보여요. 나중에 <code>.env.local</code> 설정하면 실제 서버에
          저장돼요.
        </div>
      )}

      <div className="mb-6">
        <Composer
          category={category}
          onPosted={(post) => setPosts((prev) => [post, ...prev])}
        />
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">
            아직 아무 모브도 지나가지 않았어요. 첫 흔적을 남겨보세요!
          </p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(postId) =>
              setPosts((prev) => prev.filter((p) => p.id !== postId))
            }
          />
        ))}
      </div>
    </div>
  );
}
