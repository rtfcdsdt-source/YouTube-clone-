import { toggleWatchLater } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return Response.json({ ok: false }, { status: 400 });
  const saved = await toggleWatchLater(videoId);
  return Response.json({ ok: true, saved });
}
