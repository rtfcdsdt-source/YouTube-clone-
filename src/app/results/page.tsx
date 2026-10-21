import Link from "next/link";
import { CheckIcon, SortIcon } from "@/components/icons";
import { ChannelAvatar, VideoCard } from "@/components/video";
import { SubscribeButton } from "@/components/watch";
import { getCurrentUser, isSubscribed, search } from "@/lib/data";
import { formatSubscribers } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ search_query?: string }>;
}) {
  const { search_query: query } = await searchParams;
  const term = (query ?? "").trim();
  const { videos, channels } = await search(term);
  const me = await getCurrentUser();

  const subStates = await Promise.all(channels.map((c) => isSubscribed(me.id, c.id)));

  const filtered = videos.filter(
    (video) => !channels.some((c) => video.channelSlug === c.slug),
  );

  return (
    <div className="mx-auto max-w-[1156px] px-4 py-4 lg:px-6">
      {term ? (
        <div className="mb-4 flex items-center justify-between border-b border-yt pb-3">
          <p className="text-sm text-secondary">
            Results for <span className="font-medium text-primary">{term}</span> ·{" "}
            {videos.length + channels.length} items
          </p>
          <button className="flex items-center gap-2 rounded-full border border-yt px-3 py-1.5 text-sm hover:bg-surface-2">
            <SortIcon className="h-4 w-4" /> Filters
          </button>
        </div>
      ) : null}

      {!term ? (
        <p className="py-20 text-center text-secondary">Type something in the search bar above.</p>
      ) : null}

      <div className="space-y-6">
        {channels.map((channel, i) => (
          <div key={channel.id} className="flex flex-col gap-4 border-b border-yt pb-6 sm:flex-row">
            <Link href={`/channel/${channel.slug}`} className="sm:pl-2">
              <ChannelAvatar name={channel.name} size={120} className="mx-auto" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/channel/${channel.slug}`} className="flex items-center gap-1 text-lg">
                {channel.name}
                {channel.verified ? <CheckIcon className="h-4 w-4 text-secondary" /> : null}
              </Link>
              <p className="text-xs text-secondary">
                {channel.handle} • {formatSubscribers(channel.subscribers)}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-secondary">{channel.description}</p>
            </div>
            <div className="sm:pt-6">
              <SubscribeButton
                channelId={channel.id}
                initialSubscribed={subStates[i]}
                initialSubscribers={channel.subscribers}
              />
            </div>
          </div>
        ))}

        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} layout="list" showAvatar />
        ))}
      </div>

      {term && videos.length === 0 && channels.length === 0 ? (
        <p className="py-20 text-center text-secondary">No results found for “{term}”.</p>
      ) : null}
    </div>
  );
}
