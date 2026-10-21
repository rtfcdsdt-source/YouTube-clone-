"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MoreIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { VideoCard, type CardVideo } from "@/components/video";

type HistoryRow = CardVideo & { watchedAt: string | Date };

export default function HistoryList({ rows }: { rows: HistoryRow[] }) {
  const [items, setItems] = useState(rows);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = items.filter((i) =>
    query ? i.title.toLowerCase().includes(query.toLowerCase()) : true,
  );

  const remove = async (videoId: number) => {
    setItems((list) => list.filter((i) => i.id !== videoId));
    await fetch(`/api/history?videoId=${videoId}`, { method: "DELETE" });
    router.refresh();
  };

  const clearAll = async () => {
    setItems([]);
    await fetch("/api/history", { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="min-w-0 flex-1">
        {filtered.length === 0 ? (
          <p className="py-24 text-center text-secondary">
            Watch history is empty. Videos you watch will show up here.
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((row) => (
              <div key={row.id} className="group flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <VideoCard video={row} layout="list" />
                </div>
                <button
                  onClick={() => remove(row.id)}
                  aria-label="Remove from watch history"
                  className="mt-1 hidden h-9 w-9 place-items-center rounded-full hover:bg-surface-2 group-hover:grid"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 lg:w-[300px]">
        <div className="mb-4 flex h-10 items-center gap-3 border-b border-yt px-2">
          <SearchIcon className="h-5 w-5 text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search watch history"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="space-y-1">
          <button
            onClick={clearAll}
            className="flex w-full items-center gap-4 rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
          >
            <TrashIcon className="h-5 w-5" /> Clear all watch history
          </button>
          <button className="flex w-full items-center gap-4 rounded-lg px-2 py-2 text-sm hover:bg-surface-2">
            <MoreIcon className="h-5 w-5" /> Pause watch history
          </button>
          <button className="flex w-full items-center gap-4 rounded-lg px-2 py-2 text-sm hover:bg-surface-2">
            <MoreIcon className="h-5 w-5" /> Manage all history
          </button>
        </div>
      </aside>
    </div>
  );
}
