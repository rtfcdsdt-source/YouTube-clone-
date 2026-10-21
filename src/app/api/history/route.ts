import { clearHistory, removeHistoryItem } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");
  if (videoId) await removeHistoryItem(Number(videoId));
  else await clearHistory();
  return Response.json({ ok: true });
}
