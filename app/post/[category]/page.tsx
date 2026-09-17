import { notFound } from "next/navigation";
import { isCategory, POST_COLUMNS, type Post } from "@/types/post";
import { getSupabasePublicServerClient } from "@/lib/supabase/publicServer";
import BoardClient from "@/components/BoardClient";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const supabase = getSupabasePublicServerClient();
  let posts: Post[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("category", category)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    posts = data ?? [];
  }

  return (
    <BoardClient
      category={category}
      initialPosts={posts}
      configured={Boolean(supabase)}
    />
  );
}
