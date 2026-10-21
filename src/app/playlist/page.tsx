import Link from "next/link";
import { VideoCard } from "@/components/video";
import { getPlaylist, getUserPlaylists } from "@/lib/data";
import { formatCount, formatDuration, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlaylistPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = await searchParams;
  const slug = list ?? "WL";
  const [data, all] = await Promise.all([getPlaylist(slug), getUserPlaylists()]);

  if (!data) {
    return (
      <div className="p-10 text-secondary">
        Playlist not found. <Link className="text-yt-blue" href="/feed/playlists">See your playlists</Link>
      </div>
    );
  }

  const { playlist, videos } = data;
  const totalSeconds = videos.reduce((sum, v) => sum + v.durationSec, 0);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
      <aside className="w-full shrink-0 lg:w-[360px]">
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(160deg,#3b0d18,#0f0f0f 75%)" }}
        >
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-black/40">
            {videos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={videos[0].thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <h1 className="text-2xl font-bold">{playlist.title}</h1>
          <p className="mt-2 text-sm text-white/70">You</p>
          <p className="text-xs text-white/60">
            {playlist.visibility === "private" ? "Private" : "Public"} • {videos.length} videos •{" "}
            No views
          </p>
          <p className="mt-2 text-xs text-white/60">
            Total length {formatDuration(totalSeconds)} • Updated {timeAgo(new Date())}
          </p>
          <div className="mt-4 flex gap-2">
            <button className="rounded-full bg-[#f1f1f1] px-4 py-2 text-sm font-medium text-[#0f0f0f]">
              ▶ Play all
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
              Shuffle
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          {all.map((p) => (
            <Link
              key={p.id}
              href={`/playlist?list=${p.slug}`}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-2 ${
                p.slug === playlist.slug ? "bg-surface-2" : ""
              }`}
            >
              <span className="truncate">{p.title}</span>
              <span className="text-xs text-secondary">{p.count}</span>
            </Link>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        {videos.length === 0 ? (
          <p className="py-20 text-center text-secondary">This playlist is empty.</p>
        ) : (
          videos.map((video, index) => (
            <div key={video.id} className="flex items-start gap-3">
              <span className="w-6 pt-8 text-center text-xs text-secondary">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <VideoCard video={video} layout="list" showAvatar={false} />
              </div>
            </div>
          ))
        )}
        {videos.length ? (
          <p className="pt-4 text-xs text-secondary">
            {formatCount(videos.reduce((s, v) => s + v.views, 0))} combined views
          </p>
        ) : null}
      </div>
    </div>
  );
}
