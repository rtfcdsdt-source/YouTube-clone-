import { likeComment } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) return Response.json({ ok: false }, { status: 400 });
  const likes = await likeComment(commentId);
  return Response.json({ ok: true, likes });
}
