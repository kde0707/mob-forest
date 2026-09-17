import { CATEGORIES, POST_COLUMNS, type Post } from "@/types/post";
import { getSupabasePublicServerClient } from "@/lib/supabase/publicServer";
import CategoryTile from "@/components/CategoryTile";
import RecentPosts from "@/components/RecentPosts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabasePublicServerClient();
  let recentPosts: Post[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6);

    recentPosts = data ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <section className="sticker-card relative overflow-hidden bg-canvas-mint p-8 text-center sm:p-12">
        <span className="sticker-blob absolute -right-6 -top-8 h-28 w-28 border-2 border-ink bg-yellow-soft opacity-70" />
        <span className="sticker-blob absolute -bottom-10 -left-8 h-32 w-32 border-2 border-ink bg-lavender-soft opacity-60" />

        <span className="relative inline-block rounded-full border-2 border-ink bg-surface px-3 py-1 font-display text-xs text-ink-soft">
          비공식 팬 커뮤니티
        </span>
        <h1 className="relative mt-4 font-display text-4xl text-ink sm:text-5xl">
          치이카와 모브의 숲
        </h1>
        <p className="relative mx-auto mt-3 max-w-md text-sm text-ink-soft sm:text-base">
          로그인 없이, 이름 없이 &mdash; 오늘도 지나가는 모브 하나로 목격담과
          잡담을 살짝 흘려놓고 가는 곳이에요.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => (
          <CategoryTile key={category} category={category} />
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">방금 지나간 모브들</h2>

        <div className="mt-4">
          <RecentPosts initialPosts={recentPosts} configured={Boolean(supabase)} />
        </div>
      </section>
    </div>
  );
}
