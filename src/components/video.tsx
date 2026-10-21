"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  FlagIcon,
  MoreIcon,
  PlusIcon,
  ShareIcon,
} from "@/components/icons";
import { avatarColor, formatCount, formatDuration, initials, timeAgo } from "@/lib/format";

export type CardVideo = {
  id: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationSec: number;
  views: number;
  isShort: boolean;
  isLive: boolean;
  publishedAt: Date | string;
  channelName: string;
  channelSlug: string;
  channelVerified: boolean;
  progressSec?: number;
};

export function ChannelAvatar({
  name,
  size = 36,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-medium text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: Math.max(10, size * 0.38),
      }}
    >
      {initials(name)}
    </span>
  );
}

export function VideoCard({
  video,
  showAvatar = true,
  layout = "grid",
}: {
  video: CardVideo;
  showAvatar?: boolean;
  layout?: "grid" | "list";
}) {
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    timer.current = setTimeout(() => setPreview(true), 600);
    setHover(true);
  };
  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    setPreview(false);
    setPreviewProgress(0);
    setHover(false);
  };

  const watchHref = `/watch?v=${video.id}`;

  const saveToWatchLater = async () => {
    setMenu(false);
    try {
      const res = await fetch(`/api/videos/${video.id}/watch-later`, { method: "POST" });
      const data = (await res.json()) as { saved?: boolean };
      setToast(data.saved ? "Saved to Watch later" : "Removed from Watch later");
      setTimeout(() => setToast(null), 2200);
    } catch {
      setToast("Something went wrong");
    }
  };

  const share = async () => {
    setMenu(false);
    const url = `${window.location.origin}${watchHref}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch {
      setToast("Copy failed");
    }
    setTimeout(() => setToast(null), 2200);
  };

  const thumb = (
    <div
      className={`relative w-full overflow-hidden bg-surface-2 ${
        layout === "grid" ? "rounded-xl" : "w-[168px] shrink-0 rounded-lg"
      }`}
      style={layout === "list" ? { aspectRatio: "16 / 9" } : { aspectRatio: "16 / 9" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {preview ? (
        <video
          src={video.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (el.duration) setPreviewProgress(el.currentTime / el.duration);
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {video.isLive ? "LIVE" : formatDuration(video.durationSec)}
      </span>
      {video.progressSec && video.progressSec > 0 ? (
        <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
          <span
            className="block h-full bg-yt-red"
            style={{ width: `${Math.min(100, (video.progressSec / Math.max(1, video.durationSec)) * 100)}%` }}
          />
        </span>
      ) : null}
      {preview && previewProgress > 0 ? (
        <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
          <span
            className="block h-full bg-yt-red"
            style={{ width: `${previewProgress * 100}%` }}
          />
        </span>
      ) : null}
    </div>
  );

  const meta = (
    <div className={`flex min-w-0 gap-3 ${layout === "list" ? "flex-1" : ""}`}>
      {showAvatar && layout === "grid" ? (
        <Link href={`/channel/${video.channelSlug}`} className="shrink-0">
          <ChannelAvatar name={video.channelName} size={36} />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3
          className={`line-clamp-2 font-medium leading-snug text-primary ${
            layout === "grid" ? "text-[15px]" : "text-sm"
          }`}
        >
          {video.title}
        </h3>
        <Link
          href={`/channel/${video.channelSlug}`}
          className="mt-1 flex items-center gap-1 text-[13px] text-secondary hover:text-primary"
        >
          <span className="truncate">{video.channelName}</span>
          {video.channelVerified ? <CheckIcon className="h-3.5 w-3.5 shrink-0" /> : null}
        </Link>
        <p className="text-[13px] text-secondary">
          {formatCount(video.views)} views
          {!video.isLive ? <span> • {timeAgo(video.publishedAt)}</span> : null}
        </p>
      </div>
      <div className="relative shrink-0">
        <button
          aria-label="Action menu"
          onClick={() => setMenu((m) => !m)}
          className={`grid h-9 w-9 place-items-center rounded-full text-primary hover:bg-surface-2 ${
            hover ? "opacity-100" : "opacity-0"
          }`}
        >
          <MoreIcon className="h-5 w-5" />
        </button>
        {menu ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="absolute right-0 top-9 z-50 w-56 overflow-hidden rounded-xl bg-[#282828] py-2 shadow-2xl animate-rise">
              <button className="dropdown-row" onClick={saveToWatchLater}>
                <ClockIcon className="h-5 w-5" /> Save to Watch later
              </button>
              <button className="dropdown-row" onClick={saveToWatchLater}>
                <PlusIcon className="h-5 w-5" /> Save to playlist
              </button>
              <button className="dropdown-row" onClick={share}>
                <ShareIcon className="h-5 w-5" /> Share
              </button>
              <button className="dropdown-row" onClick={() => setMenu(false)}>
                <DownloadIcon className="h-5 w-5" /> Download
              </button>
              <button className="dropdown-row" onClick={() => setMenu(false)}>
                <FlagIcon className="h-5 w-5" /> Not interested
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="group relative" onMouseEnter={enter} onMouseLeave={leave}>
      <Link href={watchHref} className={layout === "list" ? "flex gap-3" : "block"}>
        {thumb}
        {meta}
      </Link>
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded bg-[#f1f1f1] px-4 py-3 text-sm font-medium text-[#0f0f0f] shadow-xl animate-rise">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

export function ShortCard({ video }: { video: CardVideo }) {
  return (
    <Link href={`/shorts?v=${video.id}`} className="group block w-full">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-surface-2"
        style={{ aspectRatio: "9 / 16" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{video.title}</h3>
      <p className="text-[13px] text-secondary">{formatCount(video.views)} views</p>
    </Link>
  );
}

export function VideoGrid({
  videos,
  showAvatar = true,
}: {
  videos: CardVideo[];
  showAvatar?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} showAvatar={showAvatar} />
      ))}
    </div>
  );
}

export function ShortsShelf({ videos }: { videos: CardVideo[] }) {
  if (videos.length === 0) return null;
  return (
    <section className="my-2 border-y border-yt py-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-yt-red text-white">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M10 14.65v-5.3L15 12l-5 2.65z" />
          </svg>
        </span>
        <h2 className="text-xl font-semibold">Shorts</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {videos.map((v) => (
          <ShortCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}
