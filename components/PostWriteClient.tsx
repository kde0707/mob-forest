"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Category } from "@/types/post";
import { CATEGORY_LABEL } from "@/types/post";
import Composer from "./Composer";

export default function PostWriteClient({ category }: { category: Category }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link
        href={`/post/${category}`}
        className="text-sm text-ink-soft underline decoration-dotted underline-offset-2 hover:text-ink"
      >
        ← 목록으로
      </Link>

      <h1 className="mt-4 font-display text-2xl text-ink">
        {CATEGORY_LABEL[category]}에 글쓰기
      </h1>

      <div className="mt-4">
        <Composer
          category={category}
          onPosted={(post) => router.push(`/post/${category}/${post.id}`)}
        />
      </div>
    </div>
  );
}
