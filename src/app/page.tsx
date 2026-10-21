import { Suspense } from "react";
import Chips from "@/components/Chips";
import { ShortsShelf, VideoGrid } from "@/components/video";
import { getCategories, getHomeFeed } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [{ videos, shorts }, categories] = await Promise.all([
    getHomeFeed(category),
    getCategories(),
  ]);

  const isAll = !category || category === "All";
  const firstRow = videos.slice(0, 8);
  const rest = videos.slice(8);

  return (
    <div className="pb-16">
      <Suspense fallback={<div className="h-14" />}>
        <Chips categories={categories} />
      </Suspense>

      <div className="px-4 lg:px-6">
        {videos.length === 0 ? (
          <div className="py-24 text-center text-secondary">
            <p className="text-lg font-medium text-primary">No videos in this category yet</p>
            <p className="mt-2 text-sm">Try another filter or upload something of your own.</p>
          </div>
        ) : (
          <>
            <div className="pt-2">
              <VideoGrid videos={firstRow} />
            </div>
            {isAll ? <ShortsShelf videos={shorts} /> : null}
            {rest.length ? (
              <div className={isAll ? "pt-8" : "pt-8"}>
                <VideoGrid videos={rest} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
