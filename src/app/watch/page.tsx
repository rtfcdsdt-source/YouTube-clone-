import Link from "next/link";
import { notFound } from "next/navigation";
import Player from "@/components/Player";
import { ChannelAvatar, VideoCard } from "@/components/video";
import { Comments, Description, SubscribeButton, WatchActions } from "@/components/watch";
import {
  getComments,
  getRelatedVideos,
  getVideoById,
  getViewerVideoState,
} from "@/lib/data";
import { formatSubscribers } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const id = Number(v);
  if (!Number.isFinite(id)) notFound();

  const video = await getVideoById(id);
  if (!video) notFound();

  const [related, state, commentRows] = await Promise.all([
    getRelatedVideos(video),
    getViewerVideoState(video.id),
    getComments(video.id),
  ]);

  return (
    <div className="mx-auto flex max-w-[1754px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
      <div className="min-w-0 flex-1">
        <Player
          videoId={video.id}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          initialProgress={state.progress}
          nextHref={related[0] ? `/watch?v=${related[0].id}` : undefined}
        />

        <h1 className="mt-3 text-xl font-bold leading-7">{video.title}</h1>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/channel/${video.channelSlug}`}>
              <ChannelAvatar name={video.channelName} size={40} />
            </Link>
            <div className="min-w-0">
              <Link
                href={`/channel/${video.channelSlug}`}
                className="flex items-center gap-1 truncate text-base font-medium hover:text-primary"
              >
                {video.channelName}
                {video.channelVerified ? (
                  <span className="text-xs text-secondary">✓</span>
                ) : null}
              </Link>
              <p className="text-xs text-secondary">
                {formatSubscribers(video.channelSubscribers)}
              </p>
            </div>
            <div className="ml-2">
              <SubscribeButton
                channelId={video.channelId}
                initialSubscribed={state.subscribed}
                initialSubscribers={video.channelSubscribers}
              />
            </div>
          </div>

          <WatchActions
            videoId={video.id}
            initialLiked={state.liked}
            initialDisliked={state.disliked}
            initialSaved={state.saved}
          />
        </div>

        <Description
          text={video.description || video.title}
          views={video.views}
          publishedLabel={new Date(video.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        />

        <Comments
          videoId={video.id}
          initial={commentRows.map((c) => ({
            id: c.id,
            authorName: c.authorName,
            authorHandle: c.authorHandle,
            authorAvatar: c.authorAvatar,
            body: c.body,
            likes: c.likes,
            pinned: c.pinned,
            hearted: c.hearted,
            parentId: c.parentId,
            createdAt: c.createdAt,
          }))}
          channelHandle={video.channelHandle}
        />
      </div>

      <aside className="w-full shrink-0 lg:w-[402px]">
        <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {["All", "From " + video.channelName, video.category, "Related", "Recently uploaded"].map(
            (chip, i) => (
              <span
                key={chip}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  i === 0
                    ? "bg-[var(--yt-chip-active-bg)] text-[var(--yt-chip-active-text)]"
                    : "bg-[var(--yt-chip)]"
                }`}
              >
                {chip}
              </span>
            ),
          )}
        </div>
        <div className="space-y-3">
          {related.map((item) => (
            <VideoCard key={item.id} video={item} layout="list" showAvatar={false} />
          ))}
        </div>
      </aside>
    </div>
  );
}
