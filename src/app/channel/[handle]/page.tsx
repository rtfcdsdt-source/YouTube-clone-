import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { ShortCard, VideoCard } from "@/components/video";
import { SubscribeButton } from "@/components/watch";
import { getChannelSection } from "@/lib/data";
import { formatCount, formatSubscribers } from "@/lib/format";

export const dynamic = "force-dynamic";

const TABS = ["Home", "Videos", "Shorts", "Playlists", "About"];

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { handle } = await params;
  const { tab } = await searchParams;
  const data = await getChannelSection(handle);
  if (!data) notFound();

  const { channel, videos, subscribed, totalViews } = data;
  const active = tab && TABS.includes(tab) ? tab : "Home";
  const longform = videos.filter((v) => !v.isShort);
  const shorts = videos.filter((v) => v.isShort);
  const featured = [...longform].sort((a, b) => b.views - a.views)[0] ?? longform[0];

  return (
    <div className="pb-16">
      {/* Banner */}
      <div className="px-4 pt-2 lg:px-6">
        <div
          className="h-24 w-full overflow-hidden rounded-xl sm:h-32 lg:h-40"
          style={{
            background: `linear-gradient(120deg, ${channel.accent}, #0f0f0f 70%), radial-gradient(circle at 80% 20%, #ffffff22, transparent 60%)`,
          }}
        >
          <div className="flex h-full items-end p-4">
            <p className="text-lg font-semibold text-white/80">{channel.name.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="flex flex-col items-center gap-4 px-4 pt-4 sm:flex-row lg:px-6">
        <span
          className="grid h-24 w-24 shrink-0 place-items-center rounded-full text-3xl font-medium text-white lg:h-40 lg:w-40 lg:text-5xl"
          style={{ background: channel.accent }}
        >
          {channel.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold lg:text-4xl sm:justify-start">
            {channel.name}
            {channel.verified ? <CheckIcon className="h-5 w-5 text-secondary" /> : null}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            {channel.handle} • {formatSubscribers(channel.subscribers)} •{" "}
            {videos.length} videos
          </p>
          <p className="mt-1 line-clamp-1 text-sm text-secondary">
            {channel.description}{" "}
            <Link
              href={`/channel/${channel.slug}?tab=About`}
              className="font-medium text-primary"
            >
              more
            </Link>
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
            <SubscribeButton
              channelId={channel.id}
              initialSubscribed={subscribed}
              initialSubscribers={channel.subscribers}
            />
            <button className="rounded-full border border-yt px-4 py-2 text-sm font-medium hover:bg-surface-2">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-yt px-4 lg:px-6">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <Link
              key={t}
              href={`/channel/${channel.slug}${t === "Home" ? "" : `?tab=${t}`}`}
              scroll={false}
              className={`shrink-0 border-b-2 pb-3 text-base font-medium ${
                active === t ? "border-primary text-primary" : "border-transparent text-secondary"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 pt-6 lg:px-6">
        {active === "Home" ? (
          <div className="space-y-8">
            {featured ? (
              <div className="flex flex-col gap-6 border-b border-yt pb-8 lg:flex-row">
                <div className="w-full lg:w-[520px]">
                  <VideoCard video={featured} showAvatar={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">{featured.title}</h2>
                  <p className="mt-1 text-xs text-secondary">
                    {formatCount(featured.views)} views • {formatCount(videos.length)} videos
                  </p>
                  <p className="mt-4 line-clamp-4 text-sm text-secondary">
                    {featured.description || channel.description}
                  </p>
                </div>
              </div>
            ) : null}

            <section>
              <h3 className="mb-4 text-lg font-medium">Videos</h3>
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {longform.slice(0, 8).map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </section>

            {shorts.length ? (
              <section>
                <h3 className="mb-4 text-lg font-medium">Shorts</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {shorts.map((v) => (
                    <ShortCard key={v.id} video={v} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {active === "Videos" ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {longform.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : null}

        {active === "Shorts" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {shorts.map((v) => (
              <ShortCard key={v.id} video={v} />
            ))}
            {shorts.length === 0 ? (
              <p className="text-secondary">This channel has not posted any Shorts yet.</p>
            ) : null}
          </div>
        ) : null}

        {active === "Playlists" ? (
          <p className="py-12 text-secondary">
            Playlists are managed from your library. Head to{" "}
            <Link href="/feed/playlists" className="text-yt-blue">
              Playlists
            </Link>
            .
          </p>
        ) : null}

        {active === "About" ? (
          <div className="max-w-2xl space-y-4">
            <p className="whitespace-pre-line leading-relaxed">{channel.description}</p>
            <dl className="grid grid-cols-2 gap-4 text-sm text-secondary">
              <div>
                <dt className="font-medium text-primary">{formatSubscribers(channel.subscribers)}</dt>
                <dd>subscribers</dd>
              </div>
              <div>
                <dt className="font-medium text-primary">{videos.length}</dt>
                <dd>videos</dd>
              </div>
              <div>
                <dt className="font-medium text-primary">{formatCount(totalViews)}</dt>
                <dd>total views</dd>
              </div>
              <div>
                <dt className="font-medium text-primary">{channel.country}</dt>
                <dd>country</dd>
              </div>
              <div>
                <dt className="font-medium text-primary">
                  {new Date(channel.joinedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dt>
                <dd>joined</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
