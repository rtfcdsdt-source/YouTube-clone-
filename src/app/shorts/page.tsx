import ShortsFeed from "@/components/ShortsFeed";
import { getShortsFeed } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ShortsPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const rows = await getShortsFeed();

  const shorts = rows.map((row) => ({
    id: row.id,
    title: row.title,
    videoUrl: row.videoUrl,
    thumbnailUrl: row.thumbnailUrl,
    views: row.views,
    channelName: row.channelName,
    channelSlug: row.channelSlug,
    channelId: row.channelId,
    channelSubscribers: row.channelSubscribers,
  }));

  const ordered = v ? [...shorts].sort((a, b) => (a.id === Number(v) ? -1 : b.id === Number(v) ? 1 : 0)) : shorts;

  if (ordered.length === 0) {
    return <p className="p-10 text-secondary">No Shorts yet.</p>;
  }

  return <ShortsFeed shorts={ordered} />;
}
