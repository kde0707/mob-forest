"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABEL, type Category, type Post } from "@/types/post";
import { mockListTopPosts } from "@/lib/mock/store";
import { CATEGORY_STYLE } from "@/lib/categoryStyles";

export type TopPostsTab = "all" | Category;

const TAB_KEYS: TopPostsTab[] = ["all", ...CATEGORIES];

const TAB_LABEL: Record<TopPostsTab, string> = {
  all: "전체",
  ...CATEGORY_LABEL,
};

const TAB_ICON: Record<TopPostsTab, string> = {
  all: "🌲",
  sighting: CATEGORY_STYLE.sighting.emoji,
  chat: CATEGORY_STYLE.chat.emoji,
  meme: CATEGORY_STYLE.meme.emoji,
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const PREVIEW_LENGTH = 28;

function previewOf(content: string): string {
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length > PREVIEW_LENGTH
    ? `${oneLine.slice(0, PREVIEW_LENGTH)}…`
    : oneLine;
}

export default function TopReactedPosts({
  initialPostsByTab,
  configured,
}: {
  initialPostsByTab: Record<TopPostsTab, Post[]>;
  configured: boolean;
}) {
  const [postsByTab, setPostsByTab] = useState(initialPostsByTab);
  const [tab, setTab] = useState<TopPostsTab>("all");

  useEffect(() => {
    // mock 모드에서는 서버가 localStorage를 알 수 없어 클라이언트에서 조회한다.
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPostsByTab({
        all: mockListTopPosts(5),
        sighting: mockListTopPosts(5, "sighting"),
        chat: mockListTopPosts(5, "chat"),
        meme: mockListTopPosts(5, "meme"),
      });
    }
  }, [configured]);

  const posts = postsByTab[tab];

  return (
    <div>
      <div className="mb-3 flex rounded-full border-2 border-ink bg-surface p-1">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            title={TAB_LABEL[key]}
            className={`flex-1 rounded-full py-1 font-display text-[11px] transition active:scale-95 ${
              tab === key
                ? "bg-accent text-ink-on-accent"
                : "text-ink-soft hover:bg-accent-soft"
            }`}
          >
            {TAB_ICON[key]}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="sticker-card p-4 text-center text-xs text-ink-muted">
          이번주엔 아직 공감받은 글이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post, index) => {
            const style = CATEGORY_STYLE[post.category];
            return (
              <Link
                key={post.id}
                href={`/post/${post.category}/${post.id}`}
                className="sticker-card flex items-center gap-2.5 p-3 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
              >
                <span className="w-5 shrink-0 text-center font-display text-sm">
                  {RANK_MEDALS[index] ?? index + 1}
                </span>
                <span className={`shrink-0 text-base ${style.text}`}>
                  {style.emoji}
                </span>
                <p className="min-w-0 flex-1 truncate text-xs text-ink">
                  {previewOf(post.content)}
                </p>
                <span className="shrink-0 font-display text-xs text-ink-soft">
                  🐾 {post.reaction_count}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
