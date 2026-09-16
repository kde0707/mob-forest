import Link from "next/link";
import { CATEGORIES, CATEGORY_LABEL } from "@/types/post";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-[2.5px] border-ink bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-accent-soft text-lg">
            🌲
          </span>
          <span className="font-display text-xl leading-none text-ink">
            모브숲
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/post/${category}`}
              className="rounded-full border-2 border-ink px-3 py-1.5 font-display text-xs text-ink transition hover:bg-accent-soft active:scale-95 sm:text-sm"
            >
              {CATEGORY_LABEL[category]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
