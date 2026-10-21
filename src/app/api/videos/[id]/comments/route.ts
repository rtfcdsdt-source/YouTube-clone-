import { addComment } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return Response.json({ ok: false }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    body?: string;
    parentId?: number;
  };
  const text = (body.body ?? "").trim();
  if (!text) return Response.json({ ok: false, error: "empty" }, { status: 400 });

  const comment = await addComment(videoId, text.slice(0, 2000), body.parentId ?? null);
  return Response.json({ ok: true, comment });
}
