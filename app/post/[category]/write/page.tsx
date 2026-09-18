import { notFound } from "next/navigation";
import { isCategory } from "@/types/post";
import PostWriteClient from "@/components/PostWriteClient";

export default async function PostWritePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  return <PostWriteClient category={category} />;
}
