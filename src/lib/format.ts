export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${trim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return String(n);
}

function trim(value: number) {
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return String(rounded);
}

export function formatViews(n: number): string {
  return `${formatCount(n)} view${n === 1 ? "" : "s"}`;
}

export function formatSubscribers(n: number): string {
  return `${formatCount(n)} subscriber${n === 1 ? "" : "s"}`;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units: [number, string][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
    [Number.MAX_SAFE_INTEGER, "year"],
  ];
  let prev = 1;
  for (const [limit, unit] of units) {
    if (seconds < limit) {
      const value = Math.max(1, Math.floor(seconds / prev));
      return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
    prev = limit;
  }
  return "just now";
}

export function formatPublishDate(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function initials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter(Boolean);
  if (parts.length === 0) return "Y";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function avatarColor(seed: string): string {
  const palette = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#a855f7",
    "#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return palette[hash % palette.length];
}
