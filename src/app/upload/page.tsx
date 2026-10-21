"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, VideoIcon } from "@/components/icons";
import { formatDuration } from "@/lib/format";

const CATEGORIES = ["Vlogs", "Travel", "City", "Cooking", "Coding", "Music", "Wildlife", "Shorts"];
const ACCEPT_VIDEO = "video/mp4,video/webm,video/quicktime";

export default function UploadPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Vlogs");
  const [isShort, setIsShort] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [phase, setPhase] = useState<"idle" | "uploading" | "publishing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Auth guard: only signed-in users may upload.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user?: { id: number } | null }) => {
        if (!d.user) router.replace("/login");
        else setCheckingAuth(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  // Clean up object URLs.
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    };
  }, [videoPreview, thumbPreview]);

  const pickVideo = (f: File | undefined) => {
    if (!f) return;
    setError(null);
    if (!/video\/(mp4|webm|quicktime)/.test(f.type)) {
      setError("Please choose an MP4, WebM or MOV file.");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError("Video must be under 500 MB.");
      return;
    }
    setVideoFile(f);
    setVideoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setDurationSec(0);
  };

  const pickThumb = (f: File | undefined) => {
    if (!f) return;
    setError(null);
    if (!f.type.startsWith("image/")) {
      setError("Thumbnail must be an image file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Thumbnail must be under 10 MB.");
      return;
    }
    setThumbFile(f);
    setThumbPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  /** Upload the raw files, then create the video record. Uses XHR for progress. */
  const publish = async () => {
    if (!title.trim()) {
      setError("Add a title before publishing.");
      return;
    }
    if (!videoFile) {
      setError("Choose a video file first.");
      return;
    }
    setError(null);
    setPhase("uploading");
    setProgress(0);

    try {
      // 1) Upload binary files.
      const form = new FormData();
      form.append("video", videoFile);
      if (thumbFile) form.append("thumbnail", thumbFile);

      const { videoUrl, thumbnailUrl } = await new Promise<{
        videoUrl: string;
        thumbnailUrl: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText) as {
              ok?: boolean;
              videoUrl?: string;
              thumbnailUrl?: string;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.videoUrl) {
              resolve({
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl ?? "/thumbnail-placeholder.svg",
              });
            } else {
              reject(new Error(data.error ?? `Upload failed (${xhr.status})`));
            }
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(form);
      });

      // 2) Create the video record with the stored file URLs.
      setPhase("publishing");
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: isShort ? "Shorts" : category,
          isShort,
          videoUrl,
          thumbnailUrl,
          durationSec: Math.max(1, Math.round(durationSec)),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string };
      if (!data.ok || !data.id) throw new Error(data.error ?? "Publish failed");

      setPhase("done");
      router.push(isShort ? `/shorts?v=${data.id}` : `/watch?v=${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPhase("idle");
    }
  };

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 text-center text-secondary">
        Checking sign-in...
      </div>
    );
  }

  const busy = phase === "uploading" || phase === "publishing";

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 lg:px-6">
      <div className="mb-6 flex items-center justify-between border-b border-yt pb-4">
        <h1 className="text-2xl font-medium">Upload videos</h1>
        <button
          onClick={() => router.back()}
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Video file picker */}
          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-secondary">
              Video file (required)
            </span>
            <input
              ref={videoInputRef}
              type="file"
              accept={ACCEPT_VIDEO}
              className="hidden"
              onChange={(e) => pickVideo(e.target.files?.[0])}
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-yt px-4 py-6 text-center text-sm text-secondary hover:border-yt-blue hover:text-primary"
            >
              {videoFile ? (
                <span className="text-primary">
                  {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              ) : (
                <span>Click to choose an MP4, WebM or MOV file (max 500 MB)</span>
              )}
            </button>
          </div>

          {/* Thumbnail picker */}
          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-secondary">
              Thumbnail (optional)
            </span>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickThumb(e.target.files?.[0])}
            />
            <div className="flex items-center gap-3">
              {thumbPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbPreview}
                  alt="Thumbnail preview"
                  className="aspect-video w-32 rounded-lg object-cover"
                />
              ) : null}
              <button
                onClick={() => thumbInputRef.current?.click()}
                className="rounded-full border border-yt px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                {thumbFile ? "Change thumbnail" : "Choose thumbnail"}
              </button>
              {thumbFile ? (
                <button
                  onClick={() => {
                    setThumbFile(null);
                    setThumbPreview((p) => {
                      if (p) URL.revokeObjectURL(p);
                      return null;
                    });
                    if (thumbInputRef.current) thumbInputRef.current.value = "";
                  }}
                  className="text-sm text-secondary hover:text-primary"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-secondary">
              Title (required)
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              placeholder="Add a title that describes your video"
              className="w-full rounded-lg border border-yt bg-transparent px-3 py-2 text-sm outline-none focus:border-yt-blue"
            />
            <span className="mt-1 block text-right text-xs text-secondary">
              {title.length}/140
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-secondary">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Tell viewers about your video"
              className="w-full rounded-lg border border-yt bg-transparent px-3 py-2 text-sm outline-none focus:border-yt-blue"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-secondary">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== "Shorts").map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setIsShort(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    !isShort && category === c
                      ? "bg-[var(--yt-chip-active-bg)] text-[var(--yt-chip-active-text)]"
                      : "bg-[var(--yt-chip)] hover:bg-hover"
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                onClick={() => setIsShort(true)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isShort
                    ? "bg-[var(--yt-chip-active-bg)] text-[var(--yt-chip-active-text)]"
                    : "bg-[var(--yt-chip)] hover:bg-hover"
                }`}
              >
                #Shorts (vertical)
              </button>
            </div>
          </div>

          {phase === "uploading" ? (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-yt-blue transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-secondary">Uploading... {progress}%</p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-yt-red">{error}</p> : null}

          <div className="flex items-center gap-3 border-t border-yt pt-5">
            <button
              onClick={publish}
              disabled={busy}
              className="rounded-full bg-yt-blue px-5 py-2.5 text-sm font-medium text-[#0f0f0f] disabled:opacity-60"
            >
              {phase === "uploading"
                ? `Uploading ${progress}%`
                : phase === "publishing"
                  ? "Publishing..."
                  : "Publish"}
            </button>
            <button
              onClick={() => router.back()}
              className="rounded-full px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
            >
              Cancel
            </button>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            {videoPreview ? (
              <video
                key={videoPreview}
                src={videoPreview}
                poster={thumbPreview ?? undefined}
                controls
                muted
                playsInline
                className="h-full w-full object-cover"
                onLoadedMetadata={(e) => setDurationSec(e.currentTarget.duration || 0)}
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-secondary">
                Video preview
              </div>
            )}
          </div>
          <div className="rounded-xl bg-surface-2 p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 font-medium">
              <VideoIcon className="h-5 w-5" /> {isShort ? "Short" : "Video"} preview
            </p>
            <p className="text-secondary">
              File: {videoFile ? videoFile.name : "not chosen yet"}
            </p>
            {durationSec > 0 ? (
              <p className="text-secondary">Length: {formatDuration(Math.round(durationSec))}</p>
            ) : null}
            <p className="text-secondary">Visibility: Public</p>
            <p className="mt-2 text-xs text-secondary">
              Your file is stored on this server under public/uploads and plays back instantly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
