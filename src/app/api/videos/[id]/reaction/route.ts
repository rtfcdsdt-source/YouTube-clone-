import { toggleReaction } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return Response.json({ ok: false }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { kind?: string };
  const kind = body.kind === "dislike" ? "dislike" : "like";
  const result = await toggleReaction(videoId, kind);
  return Response.json({ ok: true, reaction: result });
}
