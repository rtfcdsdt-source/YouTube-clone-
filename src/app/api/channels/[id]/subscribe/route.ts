import { toggleSubscribe } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const channelId = Number(id);
  if (!Number.isFinite(channelId)) return Response.json({ ok: false }, { status: 400 });
  const subscribed = await toggleSubscribe(channelId);
  return Response.json({ ok: true, subscribed });
}
