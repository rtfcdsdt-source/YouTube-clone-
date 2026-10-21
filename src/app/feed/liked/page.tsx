import { VideoCard } from "@/components/video";
import { getLikedVideos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LikedPage() {
  const videos = await getLikedVideos();
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#3b0d18] to-[#0f0f0f] p-6 sm:flex-row sm:items-end">
        <div className="grid h-32 w-full place-items-center rounded-xl bg-black/40 text-5xl sm:w-64">
          👍
        </div>
        <div>
          <h1 className="text-3xl font-bold">Liked videos</h1>
          <p className="mt-1 text-sm text-white/70">
            You • {videos.length} videos • Private
          </p>
        </div>
      </div>
      {videos.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-secondary">
          Videos you like will appear here. Hit the 👍 on any watch page.
        </p>
      )}
    </div>
  );
}
