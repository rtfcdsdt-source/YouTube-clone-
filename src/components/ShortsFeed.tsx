"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MoreIcon,
  MuteIcon,
  PlayIcon,
  ShareIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  VolumeIcon,
} from "@/components/icons";
import { ChannelAvatar } from "@/components/video";
import { SubscribeButton } from "@/components/watch";
import { formatCount } from "@/lib/format";

type ShortItem = {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  channelName: string;
  channelSlug: string;
  channelId: number;
  channelSubscribers: number;
};

export default function ShortsFeed({ shorts }: { shorts: ShortItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [disliked, setDisliked] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }, []);

  const react = async (id: number, kind: "like" | "dislike") => {
    if (kind === "like") {
      setLiked((l) => ({ ...l, [id]: !l[id] }));
      setDisliked((d) => ({ ...d, [id]: false }));
    } else {
      setDisliked((d) => ({ ...d, [id]: !d[id] }));
      setLiked((l) => ({ ...l, [id]: false }));
    }
    await fetch(`/api/videos/${id}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[calc(100vh-56px)] snap-y snap-mandatory overflow-y-scroll no-scrollbar"
      >
        {shorts.map((short, index) => (
          <ShortItem
            key={short.id}
            short={short}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            liked={Boolean(liked[short.id])}
            disliked={Boolean(disliked[short.id])}
            onReact={(kind) => react(short.id, kind)}
            onToast={flash}
            onShare={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/shorts?v=${short.id}`,
                );
                flash("Link copied to clipboard");
              } catch {
                flash("Copy failed");
              }
            }}
            isFirst={index === 0}
          />
        ))}
      </div>
      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-[80] -translate-x-1/2 rounded bg-[#f1f1f1] px-4 py-3 text-sm font-medium text-[#0f0f0f] shadow-xl animate-rise">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function ShortItem({
  short,
  muted,
  onToggleMute,
  liked,
  disliked,
  onReact,
  onToast,
  onShare,
  isFirst,
}: {
  short: ShortItem;
  muted: boolean;
  onToggleMute: () => void;
  liked: boolean;
  disliked: boolean;
  onReact: (kind: "like" | "dislike") => void;
  onToast: (message: string) => void;
  onShare: () => void;
  isFirst: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
          } else {
            el.pause();
            setPlaying(false);
          }
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex h-full snap-start items-center justify-center py-2">
      <div className="relative flex h-full items-end gap-3">
        <div className="relative h-full max-h-[calc(100vh-72px)] overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "9 / 16" }}>
          <video
            ref={videoRef}
            src={short.videoUrl}
            poster={short.thumbnailUrl}
            muted={muted}
            loop
            playsInline
            autoPlay={isFirst}
            preload="metadata"
            onClick={() => {
              const el = videoRef.current;
              if (!el) return;
              if (el.paused) void el.play();
              else el.pause();
            }}
            className="h-full w-full cursor-pointer object-cover"
          />

          {!playing ? (
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-black/50 text-white">
                <PlayIcon className="h-8 w-8" />
              </span>
            </span>
          ) : null}

          <button
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"
          >
            {muted ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
          </button>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pr-14">
            <div className="flex items-center gap-2">
              <Link href={`/channel/${short.channelSlug}`}>
                <ChannelAvatar name={short.channelName} size={32} />
              </Link>
              <Link
                href={`/channel/${short.channelSlug}`}
                className="text-sm font-medium text-white"
              >
                {short.channelSlug.replace("-", "")}
              </Link>
              <div className="ml-1 scale-90">
                <SubscribeButton
                  channelId={short.channelId}
                  initialSubscribed={false}
                  initialSubscribers={short.channelSubscribers}
                  compact
                />
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-white">{short.title}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-white/80">
              <span className="inline-block animate-pulse">♫</span> original sound •{" "}
              {short.channelName}
            </p>
          </div>
        </div>

        {/* Action rail */}
        <div className="flex flex-col items-center gap-5 pb-6">
          <RailButton
            icon={<ThumbUpIcon filled={liked} className="h-6 w-6" />}
            label={formatCount(liked ? 12_401 : 12_400)}
            onClick={() => onReact("like")}
          />
          <RailButton
            icon={<ThumbDownIcon filled={disliked} className="h-6 w-6" />}
            label="Dislike"
            onClick={() => onReact("dislike")}
          />
          <RailButton
            icon={<span className="text-xl leading-none">💬</span>}
            label={formatCount(812)}
            onClick={() => onToast("Comments open on the watch page")}
          />
          <RailButton icon={<ShareIcon className="h-6 w-6" />} label="Share" onClick={onShare} />
          <RailButton
            icon={<MoreIcon className="h-6 w-6" />}
            label=""
            onClick={() => onToast("More actions")}
          />
          <span className="mt-2 h-9 w-9 overflow-hidden rounded-lg border border-yt">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={short.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          </span>
        </div>
      </div>
    </section>
  );
}

function RailButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 hover:bg-hover">
        {icon}
      </span>
      {label ? <span className="text-xs font-medium">{label}</span> : null}
    </button>
  );
}
