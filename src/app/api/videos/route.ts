import { createVideo, getCurrentUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Uploads are per-user: only signed-in users may publish.
  const me = await getCurrentUser();
  if (!me.id) {
    return Response.json({ ok: false, error: "Sign in to upload." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    category?: string;
    durationSec?: number;
    isShort?: boolean;
  };

  const title = (body.title ?? "").trim();
  const videoUrl = (body.videoUrl ?? "").trim();
  if (!title || !videoUrl) {
    return Response.json({ ok: false, error: "Title and video URL are required" }, { status: 400 });
  }

  // Local uploads (e.g. /uploads/videos/xxx.mp4) pass through unchanged, as do
  // remote URLs. Fall back to the local SVG placeholder when no thumbnail given.
  const id = await createVideo({
    title: title.slice(0, 140),
    description: (body.description ?? "").slice(0, 4000),
    videoUrl,
    thumbnailUrl: (body.thumbnailUrl ?? "").trim() || "/thumbnail-placeholder.svg",
    category: body.category || "Vlogs",
    durationSec: Math.max(1, Math.floor(body.durationSec ?? 60)),
    isShort: Boolean(body.isShort),
  });

  return Response.json({ ok: true, id });
}
