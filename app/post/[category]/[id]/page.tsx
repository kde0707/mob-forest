import { notFound } from "next/navigation";
import { isCategory, POST_COLUMNS, type Post } from "@/types/post";
import { COMMENT_COLUMNS, type Comment } from "@/types/comment";
import { getSupabasePublicServerClient } from "@/lib/supabase/publicServer";
import PostDetailClient from "@/components/PostDetailClient";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  if (!isCategory(category)) notFound();

  const supabase = getSupabasePublicServerClient();
  let post: Post | null = null;
  let comments: Comment[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("id", id)
      .eq("category", category)
      .eq("status", "published")
      .maybeSingle();

    if (!data) notFound();
    post = data;

    const { data: commentData } = await supabase
      .from("comments")
      .select(COMMENT_COLUMNS)
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    comments = commentData ?? [];
  }

  return (
    <PostDetailClient
      category={category}
      postId={id}
      initialPost={post}
      initialComments={comments}
      configured={Boolean(supabase)}
    />
  );
}
