import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { ChannelAvatar, VideoCard } from "@/components/video";
import {
  getChannelSection,
  getHistory,
  getLikedVideos,
  getUserPlaylists,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function YouPage() {
  const [history, playlists, liked] = await Promise.all([
    getHistory(),
    getUserPlaylists(),
    getLikedVideos(),
  ]);
  const me = await getChannelSection("you-studio");
  const yourVideos = me?.videos ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      <div className="mb-8 flex items-center gap-4">
        <ChannelAvatar name="You" size={80} />
        <div>
          <h1 className="text-3xl font-bold">You</h1>
          <Link href="/feed/history" className="text-sm text-secondary hover:text-primary">
            View channel ›
          </Link>
        </div>
      </div>

      <Section title="History" href="/feed/history">
        {history.length ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {history.slice(0, 8).map((row) => (
              <div key={row.id} className="w-[300px] shrink-0">
                <VideoCard
                  video={{ ...row, progressSec: row.progressSec }}
                  layout="list"
                  showAvatar={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Videos you watch will appear here." />
        )}
      </Section>

      <Section title="Playlists" href="/feed/playlists">
        {playlists.length ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {playlists.map((p) => (
              <Link
                key={p.id}
                href={`/playlist?list=${p.slug}`}
                className="w-[220px] shrink-0"
              >
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-2">
                  {p.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumb} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-sm font-medium">{p.title}</p>
                <p className="text-xs text-secondary">{p.count} videos</p>
              </Link>
            ))}
          </div>
        ) : (
          <Empty text="No playlists yet." />
        )}
      </Section>

      <Section title="Your videos" href="/upload">
        {yourVideos.length ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {yourVideos.map((row) => (
              <div key={row.id} className="w-[300px] shrink-0">
                <VideoCard video={row} layout="list" showAvatar={false} />
              </div>
            ))}
          </div>
        ) : (
          <Empty text="You have not uploaded anything yet. Use Create → Upload video." />
        )}
      </Section>

      <Section title="Liked videos" href="/playlist?list=LL">
        {liked.length ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {liked.slice(0, 8).map((row) => (
              <div key={row.id} className="w-[300px] shrink-0">
                <VideoCard video={row} layout="list" showAvatar={false} />
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Videos you like will appear here." />
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link
          href={href}
          className="flex items-center gap-1 rounded-full border border-yt px-3 py-1.5 text-sm hover:bg-surface-2"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-surface-2 px-4 py-8 text-center text-sm text-secondary">{text}</p>;
}
