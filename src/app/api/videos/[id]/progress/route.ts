import { recordView } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return Response.json({ ok: false }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { progress?: number };
  const progress = Number.isFinite(body.progress) ? Math.max(0, Math.floor(body.progress!)) : 0;
  await recordView(videoId, progress);
  return Response.json({ ok: true });
}
