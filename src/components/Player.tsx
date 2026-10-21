"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ExitFullscreenIcon,
  FullscreenIcon,
  MiniplayerIcon,
  MuteIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  SettingsIcon,
  TheaterIcon,
  VolumeIcon,
} from "@/components/icons";
import { formatDuration } from "@/lib/format";

const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function Player({
  videoId,
  src,
  poster,
  initialProgress = 0,
  nextHref,
  onEnded,
}: {
  videoId: number;
  src: string;
  poster: string;
  initialProgress?: number;
  nextHref?: string;
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.6);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [rate, setRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [theater, setTheater] = useState(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const flash = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 900);
  }, []);

  // Autoplay muted + resume progress
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.playbackRate = 1;
    const attempt = el.play();
    if (attempt && typeof attempt.then === "function") {
      attempt
        .then(() => {
          setPlaying(true);
          setStarted(true);
        })
        .catch(() => setPlaying(false));
    }
    if (initialProgress > 2) {
      const apply = () => {
        if (el.duration && initialProgress < el.duration - 5) el.currentTime = initialProgress;
      };
      if (el.readyState >= 1) apply();
      else el.addEventListener("loadedmetadata", apply, { once: true });
    }
  }, [initialProgress, videoId]);

  // Persist watch progress
  useEffect(() => {
    let cancelled = false;
    const push = () => {
      const el = videoRef.current;
      if (!el || cancelled || !el.currentTime) return;
      void fetch(`/api/videos/${videoId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: Math.floor(el.currentTime) }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const id = setInterval(push, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
      push();
    };
  }, [videoId]);

  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2800);
  }, []);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setStarted(true));
      flash(el.muted ? "Playing (muted)" : "Playing");
    } else {
      el.pause();
      flash("Paused");
    }
    showControlsBriefly();
  }, [flash, showControlsBriefly]);

  const seekBy = useCallback(
    (delta: number) => {
      const el = videoRef.current;
      if (!el) return;
      el.currentTime = Math.min(Math.max(0, el.currentTime + delta), el.duration || 0);
      flash(`${delta > 0 ? "+" : ""}${delta}s`);
      showControlsBriefly();
    },
    [flash, showControlsBriefly],
  );

  const seekToPct = useCallback((pct: number) => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    el.currentTime = Math.min(Math.max(0, pct * el.duration), el.duration);
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.volume === 0) {
      el.volume = 0.6;
      setVolume(0.6);
    }
    showControlsBriefly();
  }, [showControlsBriefly]);

  const changeVolume = useCallback((value: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = value;
    el.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const node = wrapRef.current;
    if (!node) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await node.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (target && target.isContentEditable) return;
      const el = videoRef.current;
      if (!el) return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "j":
          seekBy(-10);
          break;
        case "l":
          seekBy(10);
          break;
        case "arrowleft":
          e.preventDefault();
          seekBy(-5);
          break;
        case "arrowright":
          e.preventDefault();
          seekBy(5);
          break;
        case "arrowup":
          e.preventDefault();
          changeVolume(Math.min(1, el.volume + 0.05));
          flash(`Volume ${Math.round(Math.min(1, el.volume + 0.05) * 100)}%`);
          break;
        case "arrowdown":
          e.preventDefault();
          changeVolume(Math.max(0, el.volume - 0.05));
          flash(`Volume ${Math.round(Math.max(0, el.volume - 0.05) * 100)}%`);
          break;
        case "m":
          toggleMute();
          flash(el.muted ? "Unmuted" : "Muted");
          break;
        case "f":
          void toggleFullscreen();
          break;
        case "t":
          setTheater((t) => !t);
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            seekToPct(Number(e.key) / 10);
            flash(`${Number(e.key) * 10}%`);
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeVolume, flash, seekBy, seekToPct, toggleFullscreen, toggleMute, togglePlay]);

  const pct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  const pointerPct = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const startScrub = (e: React.PointerEvent) => {
    setScrubbing(true);
    seekToPct(pointerPct(e.clientX));
    const move = (ev: PointerEvent) => seekToPct(pointerPct(ev.clientX));
    const up = () => {
      setScrubbing(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const theaterClass = theater ? "h-[76vh]" : "aspect-video";

  return (
    <div>
      <div
        ref={wrapRef}
        tabIndex={0}
        onMouseMove={showControlsBriefly}
        onMouseLeave={() => playing && setShowControls(false)}
        onDoubleClick={() => void toggleFullscreen()}
        className={`relative w-full select-none overflow-hidden bg-black ${theaterClass}`}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onClick={togglePlay}
          onPlay={() => {
            setPlaying(true);
            setStarted(true);
            showControlsBriefly();
          }}
          onPause={() => {
            setPlaying(false);
            setShowControls(true);
          }}
          onTimeUpdate={(e) => {
            if (!scrubbing) setCurrent(e.currentTarget.currentTime);
          }}
          onProgress={(e) => {
            const el = e.currentTarget;
            if (el.buffered.length) setBuffered(el.buffered.end(el.buffered.length - 1));
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={() => {
            setPlaying(false);
            setShowControls(true);
            onEnded?.();
          }}
        />

        {/* Center overlay */}
        {!playing ? (
          <button
            onClick={togglePlay}
            aria-label="Play"
            className="absolute inset-0 grid place-items-center bg-black/10"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-black/60 text-white">
              <PlayIcon className="h-8 w-8" />
            </span>
          </button>
        ) : null}

        {muted && started ? (
          <button
            onClick={toggleMute}
            className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-medium text-white hover:bg-black/85"
          >
            <MuteIcon className="h-4 w-4" /> Tap to unmute
          </button>
        ) : null}

        {toast ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-black/75 px-4 py-2 text-sm font-medium text-white">
            {toast}
          </div>
        ) : null}

        {nextHref && !playing && current > 0 && duration > 0 && current >= duration - 0.2 ? (
          <LinkPill href={nextHref} />
        ) : null}

        {/* Controls */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-1 pt-8 transition-opacity ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress */}
          <div
            ref={barRef}
            onPointerDown={startScrub}
            onMouseMove={(e) => setHoverPct(pointerPct(e.clientX))}
            onMouseLeave={() => setHoverPct(null)}
            className="group relative flex h-4 cursor-pointer items-center"
          >
            <div className="relative h-[3px] w-full bg-white/30 transition-all group-hover:h-[5px]">
              <div className="absolute inset-y-0 left-0 bg-white/40" style={{ width: `${bufferedPct}%` }} />
              <div className="absolute inset-y-0 left-0 bg-yt-red" style={{ width: `${pct}%` }} />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 scale-0 rounded-full bg-yt-red transition-transform group-hover:scale-100"
                style={{ left: `calc(${pct}% - 6px)` }}
              />
            </div>
            {hoverPct !== null && duration ? (
              <span
                className="pointer-events-none absolute -top-7 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white"
                style={{ left: `calc(${hoverPct * 100}% - 22px)` }}
              >
                {formatDuration(hoverPct * duration)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 pb-1 text-white">
            <CtrlButton label={playing ? "Pause (k)" : "Play (k)"} onClick={togglePlay}>
              {playing ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
            </CtrlButton>
            <CtrlButton label="Next" onClick={() => nextHref && (window.location.href = nextHref)}>
              <NextIcon className="h-6 w-6" />
            </CtrlButton>

            <div className="group/vol flex items-center">
              <CtrlButton label={muted ? "Unmute (m)" : "Mute (m)"} onClick={toggleMute}>
                {muted || volume === 0 ? (
                  <MuteIcon className="h-6 w-6" />
                ) : (
                  <VolumeIcon className="h-6 w-6" />
                )}
              </CtrlButton>
              <input
                type="range"
                className="yt-range ml-1 w-0 opacity-0 transition-all duration-200 group-hover/vol:w-16 group-hover/vol:opacity-100"
                style={{ ["--fill" as string]: `${volume * 100}%` }}
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="Volume"
              />
            </div>

            <span className="ml-2 text-[13px] tabular-nums">
              {formatDuration(current)} / {formatDuration(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <CtrlButton
                label="Settings"
                onClick={() => setShowSettings((s) => !s)}
              >
                <SettingsIcon className="h-6 w-6" />
              </CtrlButton>
              <CtrlButton label="Miniplayer" onClick={() => flash("Miniplayer coming soon")}>
                <MiniplayerIcon className="h-6 w-6" />
              </CtrlButton>
              <CtrlButton label="Theater mode (t)" onClick={() => setTheater((t) => !t)}>
                <TheaterIcon className="h-6 w-6" />
              </CtrlButton>
              <CtrlButton label="Full screen (f)" onClick={() => void toggleFullscreen()}>
                {fullscreen ? (
                  <ExitFullscreenIcon className="h-6 w-6" />
                ) : (
                  <FullscreenIcon className="h-6 w-6" />
                )}
              </CtrlButton>
            </div>
          </div>
        </div>

        {showSettings ? (
          <div className="absolute bottom-16 right-4 w-56 overflow-hidden rounded-lg bg-black/90 py-2 text-sm text-white">
            <p className="px-4 py-1.5 text-xs uppercase tracking-wide text-white/60">
              Playback speed
            </p>
            <div className="max-h-56 overflow-y-auto">
              {RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    const el = videoRef.current;
                    if (el) el.playbackRate = r;
                    setRate(r);
                    flash(`${r}x`);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-white/10"
                >
                  {r === 1 ? "Normal" : `${r}x`}
                  {rate === r ? <span className="text-yt-red">✓</span> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {theater ? (
        <button
          onClick={() => setTheater(false)}
          className="mt-2 hidden items-center gap-1 text-xs text-secondary hover:text-primary lg:flex"
        >
          <PrevIcon className="h-4 w-4" /> Exit theater mode
        </button>
      ) : null}
    </div>
  );
}

function CtrlButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full text-white/95 hover:text-white"
    >
      {children}
    </button>
  );
}

function LinkPill({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-black"
    >
      Play next <ChevronRight className="h-4 w-4" />
    </a>
  );
}
