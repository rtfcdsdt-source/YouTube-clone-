import Link from "next/link";
import { Suspense } from "react";
import Chips from "@/components/Chips";
import { ChannelAvatar, VideoGrid } from "@/components/video";
import { getCategories, getSubscribedChannels, getSubscriptionsFeed } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const [videos, channels, categories] = await Promise.all([
    getSubscriptionsFeed(),
    getSubscribedChannels(),
    getCategories(),
  ]);

  return (
    <div className="pb-16">
      <Suspense fallback={<div className="h-14" />}>
        <Chips categories={categories} />
      </Suspense>
      <div className="px-4 lg:px-6">
        <div className="mb-6 flex items-center gap-3 overflow-x-auto no-scrollbar border-b border-yt pb-4">
          <h1 className="shrink-0 text-2xl font-bold">Latest</h1>
          {channels.map((c) => (
            <Link key={c.id} href={`/channel/${c.slug}`} className="shrink-0 text-center">
              <ChannelAvatar name={c.name} size={56} className="mx-auto" />
              <p className="mt-1 w-16 truncate text-xs text-secondary">{c.name}</p>
            </Link>
          ))}
        </div>

        {videos.length ? (
          <VideoGrid videos={videos} />
        ) : (
          <p className="py-20 text-center text-secondary">
            You have no subscriptions yet. Subscribe to a channel to see its uploads here.
          </p>
        )}
      </div>
    </div>
  );
}
