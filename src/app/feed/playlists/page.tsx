import Link from "next/link";
import { PlaylistIcon } from "@/components/icons";
import { getUserPlaylists } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const playlists = await getUserPlaylists();
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Playlists</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {playlists.map((p) => (
          <Link
            key={p.id}
            href={`/playlist?list=${p.slug}`}
            className="group rounded-xl p-3 hover:bg-surface"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-2">
              {p.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumb} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full place-items-center text-secondary">
                  <PlaylistIcon className="h-10 w-10" />
                </span>
              )}
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                ▶ {p.count}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 font-medium">{p.title}</p>
            <p className="mt-1 text-xs text-secondary">
              Playlist • {p.visibility === "private" ? "Private" : "Public"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
