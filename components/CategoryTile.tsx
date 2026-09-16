import Link from "next/link";
import {
  CATEGORY_DESCRIPTION,
  CATEGORY_LABEL,
  type Category,
} from "@/types/post";
import { CATEGORY_STYLE } from "@/lib/categoryStyles";

export default function CategoryTile({ category }: { category: Category }) {
  const style = CATEGORY_STYLE[category];

  return (
    <Link
      href={`/post/${category}`}
      className={`sticker-card flex flex-col gap-3 p-6 transition hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] ${style.bg}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-surface text-2xl">
        {style.emoji}
      </span>
      <h3 className={`font-display text-2xl ${style.text}`}>
        {CATEGORY_LABEL[category]}
      </h3>
      <p className="text-sm text-ink-soft">{CATEGORY_DESCRIPTION[category]}</p>
    </Link>
  );
}
