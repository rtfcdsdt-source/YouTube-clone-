"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

export default function Chips({ categories }: { categories: string[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const active = params.get("category") ?? "All";
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => scroller.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="sticky top-14 z-30 bg-yt">
      <div className="relative flex items-center px-4 py-3 lg:px-6">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-320)}
          className="absolute left-0 z-10 hidden h-8 w-8 place-items-center rounded-full bg-yt shadow hover:bg-surface-2 lg:grid"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={scroller}
          className="flex flex-1 gap-3 overflow-x-auto no-scrollbar"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((c) => {
            const isActive = active === c;
            const href = c === "All" ? pathname : `${pathname}?category=${encodeURIComponent(c)}`;
            return (
              <Link
                key={c}
                href={href}
                scroll={false}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--yt-chip-active-bg)] text-[var(--yt-chip-active-text)]"
                    : "bg-[var(--yt-chip)] hover:bg-hover"
                }`}
              >
                {c}
              </Link>
            );
          })}
        </div>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(320)}
          className="absolute right-0 z-10 hidden h-8 w-8 place-items-center rounded-full bg-yt shadow hover:bg-surface-2 lg:grid"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
