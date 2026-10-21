"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BellIcon,
  BellOnIcon,
  CheckIcon,
  ChevronDown,
  CloseIcon,
  DownloadIcon,
  MoreIcon,
  SaveIcon,
  ShareIcon,
  SortIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "@/components/icons";
import { ChannelAvatar } from "@/components/video";
import { formatCount, timeAgo } from "@/lib/format";

export type CommentRow = {
  id: number;
  authorName: string;
  authorHandle: string;
  authorAvatar: string | null;
  body: string;
  likes: number;
  pinned: boolean;
  hearted: boolean;
  parentId: number | null;
  createdAt: string | Date;
};

export function SubscribeButton({
  channelId,
  initialSubscribed,
  initialSubscribers,
  compact,
}: {
  channelId: number;
  initialSubscribed: boolean;
  initialSubscribers: number;
  compact?: boolean;
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [count, setCount] = useState(initialSubscribers);
  const [bell, setBell] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setSubscribed((s) => !s);
    setCount((c) => c + (subscribed ? -1 : 1));
    await fetch(`/api/channels/${channelId}/subscribe`, { method: "POST" });
    router.refresh();
  };

  if (subscribed) {
    return (
      <div className="flex items-center">
        <button
          onClick={() => setBell((b) => !b)}
          className={`flex items-center gap-2 rounded-l-full bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-hover ${
            compact ? "" : "h-9"
          }`}
        >
          {bell ? <BellOnIcon className="h-5 w-5" /> : <BellIcon className="h-5 w-5" />}
          <span className="hidden sm:inline">{bell ? "All" : "Personalized"}</span>
        </button>
        <span className="h-6 w-px bg-yt" />
        <button
          onClick={toggle}
          className="rounded-r-full bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-hover"
        >
          Subscribed <ChevronDown className="inline h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-full bg-[#f1f1f1] px-4 py-2 text-sm font-medium text-[#0f0f0f] hover:bg-white"
    >
      Subscribe
      <span className="hidden text-xs opacity-70 sm:inline">{formatCount(count)}</span>
    </button>
  );
}

export function WatchActions({
  videoId,
  initialLiked,
  initialDisliked,
  initialSaved,
}: {
  videoId: number;
  initialLiked: boolean;
  initialDisliked: boolean;
  initialSaved: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [disliked, setDisliked] = useState(initialDisliked);
  const [saved, setSaved] = useState(initialSaved);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const react = async (kind: "like" | "dislike") => {
    const isLike = kind === "like";
    if (isLike) {
      setLiked((l) => !l);
      setDisliked(false);
    } else {
      setDisliked((d) => !d);
      setLiked(false);
    }
    await fetch(`/api/videos/${videoId}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
  };

  const save = async () => {
    const res = await fetch(`/api/videos/${videoId}/watch-later`, { method: "POST" });
    const data = (await res.json()) as { saved?: boolean };
    setSaved(Boolean(data.saved));
    flash(data.saved ? "Saved to Watch later" : "Removed from Watch later");
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Link copied to clipboard");
    } catch {
      flash("Copy failed");
    }
  };

  return (
    <div className="relative flex items-center gap-2 overflow-x-auto no-scrollbar">
      <div className="flex shrink-0 items-center rounded-full bg-surface-2">
        <button
          onClick={() => react("like")}
          className={`flex items-center gap-2 rounded-l-full py-2 pl-3 pr-3 text-sm font-medium hover:bg-hover ${
            liked ? "text-primary" : ""
          }`}
        >
          <ThumbUpIcon filled={liked} className="h-5 w-5" />
          {formatCount(liked ? 128_400 + 1 : 128_400)}
        </button>
        <span className="h-6 w-px bg-yt" />
        <button
          onClick={() => react("dislike")}
          className="rounded-r-full py-2 pl-3 pr-3 hover:bg-hover"
          aria-label="Dislike"
        >
          <ThumbDownIcon filled={disliked} className="h-5 w-5" />
        </button>
      </div>

      <PillButton onClick={share} icon={<ShareIcon className="h-5 w-5" />} label="Share" />
      <PillButton
        onClick={save}
        icon={saved ? <CheckIcon className="h-5 w-5" /> : <SaveIcon className="h-5 w-5" />}
        label={saved ? "Saved" : "Save"}
      />
      <PillButton
        onClick={() => flash("Download started (demo)")}
        icon={<DownloadIcon className="h-5 w-5" />}
        label="Download"
        className="hidden sm:flex"
      />
      <button
        onClick={() => flash("More actions")}
        className="hidden h-9 w-9 place-items-center rounded-full bg-surface-2 hover:bg-hover sm:grid"
        aria-label="More"
      >
        <MoreIcon className="h-5 w-5" />
      </button>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded bg-[#f1f1f1] px-4 py-3 text-sm font-medium text-[#0f0f0f] shadow-xl animate-rise">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function PillButton({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-medium hover:bg-hover ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

export function Description({
  text,
  views,
  publishedLabel,
}: {
  text: string;
  views: number;
  publishedLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => !open && setOpen(true)}
      className={`mt-3 cursor-pointer rounded-xl bg-surface-2 p-3 text-sm ${
        open ? "" : "hover:bg-hover"
      }`}
    >
      <p className="font-medium">
        {formatCount(views)} views • {publishedLabel}
        <span className="ml-2 text-secondary">{open ? "" : "...more"}</span>
      </p>
      <p className={`mt-2 whitespace-pre-line leading-relaxed ${open ? "" : "line-clamp-2"}`}>
        {text}
      </p>
      {open ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          className="mt-2 flex items-center gap-1 font-medium"
        >
          <CloseIcon className="h-4 w-4" /> Show less
        </button>
      ) : null}
    </div>
  );
}

export function Comments({
  videoId,
  initial,
  channelHandle,
}: {
  videoId: number;
  initial: CommentRow[];
  channelHandle: string;
}) {
  const [rows, setRows] = useState(initial);
  const [sort, setSort] = useState<"top" | "new">("top");
  const [body, setBody] = useState("");
  const [focused, setFocused] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sort === "top") {
      copy.sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          b.likes - a.likes ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return copy;
  }, [rows, sort]);

  const submit = async () => {
    if (!body.trim()) return;
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = (await res.json()) as { comment?: CommentRow };
    if (data.comment) setRows((r) => [data.comment as CommentRow, ...r]);
    setBody("");
    setFocused(false);
  };

  const submitReply = async (parentId: number) => {
    if (!replyBody.trim()) return;
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody, parentId }),
    });
    const data = (await res.json()) as { comment?: CommentRow };
    if (data.comment) setRows((r) => [...r, data.comment as CommentRow]);
    setReplyBody("");
    setReplyTo(null);
  };

  const like = async (id: number) => {
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, likes: row.likes + (liked[id] ? -1 : 1) } : row)),
    );
    await fetch(`/api/comments/${id}/like`, { method: "POST" });
  };

  return (
    <section className="mt-6">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold">{rows.length.toLocaleString()} Comments</h2>
        <button
          onClick={() => setSort((s) => (s === "top" ? "new" : "top"))}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <SortIcon className="h-5 w-5" /> Sort by {sort === "top" ? "top comments" : "newest first"}
        </button>
      </div>

      <div className="mt-6 flex gap-4">
        <ChannelAvatar name="You" size={40} />
        <div className="flex-1">
          <input
            value={body}
            onFocus={() => setFocused(true)}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment..."
            className="w-full border-b border-yt bg-transparent pb-2 text-sm outline-none focus:border-primary"
          />
          {focused ? (
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setFocused(false);
                  setBody("");
                }}
                className="rounded-full px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!body.trim()}
                className="rounded-full bg-yt-blue px-4 py-2 text-sm font-medium text-[#0f0f0f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Comment
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {sorted.map((c) => (
          <article key={c.id} className="flex gap-4">
            <ChannelAvatar name={c.authorName} size={40} />
            <div className="min-w-0 flex-1">
              {c.pinned ? (
                <p className="mb-1 text-xs text-secondary">Pinned by {channelHandle}</p>
              ) : null}
              <p className="text-[13px]">
                <span className="font-medium">{c.authorHandle}</span>{" "}
                <span className="text-secondary">{timeAgo(c.createdAt)}</span>
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{c.body}</p>
              <div className="mt-2 flex items-center gap-3 text-secondary">
                <button
                  onClick={() => like(c.id)}
                  className="flex items-center gap-1.5 hover:text-primary"
                >
                  <ThumbUpIcon filled={Boolean(liked[c.id])} className="h-4 w-4" />
                  <span className="text-xs">{c.likes > 0 ? formatCount(c.likes) : ""}</span>
                </button>
                <button className="hover:text-primary" aria-label="Dislike comment">
                  <ThumbDownIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setReplyTo(c.id);
                    setReplyBody("");
                  }}
                  className="text-xs font-medium hover:text-primary"
                >
                  Reply
                </button>
                {c.hearted ? <span className="text-xs">❤️ by creator</span> : null}
              </div>
              {replyTo === c.id ? (
                <div className="mt-3 flex gap-3">
                  <ChannelAvatar name="You" size={28} />
                  <div className="flex-1">
                    <input
                      autoFocus
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Add a reply..."
                      className="w-full border-b border-yt bg-transparent pb-2 text-sm outline-none focus:border-primary"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setReplyTo(null)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitReply(c.id)}
                        disabled={!replyBody.trim()}
                        className="rounded-full bg-yt-blue px-3 py-1.5 text-xs font-medium text-[#0f0f0f] disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
