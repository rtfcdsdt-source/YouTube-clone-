import HistoryList from "@/components/HistoryList";
import { getHistory } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const rows = await getHistory();
  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Watch history</h1>
      <HistoryList
        rows={rows.map((row) => ({
          id: row.id,
          title: row.title,
          thumbnailUrl: row.thumbnailUrl,
          videoUrl: row.videoUrl,
          durationSec: row.durationSec,
          views: row.views,
          isShort: row.isShort,
          isLive: row.isLive,
          publishedAt: row.publishedAt,
          channelName: row.channelName,
          channelSlug: row.channelSlug,
          channelVerified: row.channelVerified,
          progressSec: row.progressSec,
          watchedAt: row.watchedAt,
        }))}
      />
    </div>
  );
}
