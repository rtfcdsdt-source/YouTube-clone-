import { VideoCard } from "@/components/video";
import { getHomeFeed } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const { videos, shorts } = await getHomeFeed();
  const ranked = [...videos].sort((a, b) => b.views - a.views).slice(0, 30);
  const shortsRanked = [...shorts].sort((a, b) => b.views - a.views);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Trending</h1>
      <div className="space-y-4">
        {ranked.map((video, index) => (
          <div key={video.id} className="flex items-start gap-3">
            <span className="w-8 pt-6 text-center text-xl font-bold text-secondary">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <VideoCard video={video} layout="list" />
            </div>
          </div>
        ))}
      </div>

      {shortsRanked.length ? (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Trending Shorts</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {shortsRanked.map((v) => (
              <VideoCard key={v.id} video={v} showAvatar={false} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
