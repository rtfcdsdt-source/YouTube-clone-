import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
// Allow large uploads (Next.js route handlers stream the body; this is a hint).
export const maxDuration = 300;

const VIDEO_MIMES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
const MAX_THUMB_BYTES = 10 * 1024 * 1024; // 10 MB

const DEFAULT_THUMBNAIL = "/thumbnail-placeholder.svg";

function extFor(file: File, allowed: Record<string, string>): string | null {
  const fromMime = allowed[file.type];
  if (fromMime) return fromMime;
  // Fall back to the file extension when the mime is missing/generic.
  const ext = path.extname(file.name).toLowerCase().replace(/^\./, "");
  return Object.values(allowed).includes(ext) ? ext : null;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Could not read upload." }, { status: 400 });
  }

  const video = form.get("video");
  if (!(video instanceof File) || video.size === 0) {
    return Response.json({ ok: false, error: "No video file received." }, { status: 400 });
  }
  const videoExt = extFor(video, VIDEO_MIMES);
  if (!videoExt) {
    return Response.json(
      { ok: false, error: "Video must be MP4, WebM or MOV." },
      { status: 400 },
    );
  }
  if (video.size > MAX_VIDEO_BYTES) {
    return Response.json({ ok: false, error: "Video must be under 500 MB." }, { status: 400 });
  }

  const thumbRaw = form.get("thumbnail");
  let thumbExt: string | null = null;
  if (thumbRaw instanceof File && thumbRaw.size > 0) {
    if (!thumbRaw.type.startsWith("image/")) {
      return Response.json({ ok: false, error: "Thumbnail must be an image." }, { status: 400 });
    }
    if (thumbRaw.size > MAX_THUMB_BYTES) {
      return Response.json({ ok: false, error: "Thumbnail must be under 10 MB." }, { status: 400 });
    }
    thumbExt =
      path.extname(thumbRaw.name).toLowerCase().replace(/^\./, "") ||
      thumbRaw.type.split("/")[1] ||
      "jpg";
  }

  const videosDir = path.join(process.cwd(), "public", "uploads", "videos");
  const thumbsDir = path.join(process.cwd(), "public", "uploads", "thumbnails");
  await mkdir(videosDir, { recursive: true });
  await mkdir(thumbsDir, { recursive: true });

  const videoName = `${randomUUID()}.${videoExt}`;
  await writeFile(path.join(videosDir, videoName), Buffer.from(await video.arrayBuffer()));
  const videoUrl = `/uploads/videos/${videoName}`;

  let thumbnailUrl = DEFAULT_THUMBNAIL;
  if (thumbRaw instanceof File && thumbRaw.size > 0 && thumbExt) {
    const thumbName = `${randomUUID()}.${thumbExt}`;
    await writeFile(path.join(thumbsDir, thumbName), Buffer.from(await thumbRaw.arrayBuffer()));
    thumbnailUrl = `/uploads/thumbnails/${thumbName}`;
  }

  return Response.json({ ok: true, videoUrl, thumbnailUrl });
}
