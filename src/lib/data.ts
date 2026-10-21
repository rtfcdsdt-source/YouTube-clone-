import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import {
  channels,
  comments,
  playlistItems,
  playlists,
  reactions,
  subscriptions,
  users,
  videos,
  watchHistory,
} from "@/db/schema";

export type FeedVideo = {
  id: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationSec: number;
  views: number;
  category: string;
  isShort: boolean;
  isLive: boolean;
  publishedAt: Date;
  channelId: number;
  channelName: string;
  channelSlug: string;
  channelHandle: string;
  channelAvatar: string | null;
  channelVerified: boolean;
  channelSubscribers: number;
};

export type CurrentUser = { id: number; name: string; handle: string };

const FEED_COLUMNS = {
  id: videos.id,
  title: videos.title,
  description: videos.description,
  thumbnailUrl: videos.thumbnailUrl,
  videoUrl: videos.videoUrl,
  durationSec: videos.durationSec,
  views: videos.views,
  category: videos.category,
  isShort: videos.isShort,
  isLive: videos.isLive,
  publishedAt: videos.publishedAt,
  channelId: channels.id,
  channelName: channels.name,
  channelSlug: channels.slug,
  channelHandle: channels.handle,
  channelVerified: channels.verified,
  channelSubscribers: channels.subscribers,
  channelAvatar: sql<string | null>`null`.as("channel_avatar"),
};

async function ready() {
  await ensureSeed();
}

import { getSessionUser } from "@/lib/auth";

export async function getCurrentUser(): Promise<CurrentUser> {
  await ready();
  // Real auth: whoever holds a valid `session` cookie. Falls back to the
  // logged-out guest identity (id 0) so logged-out pages keep working.
  const sessionUser = await getSessionUser().catch(() => null);
  if (sessionUser) {
    return { id: sessionUser.id, name: sessionUser.name, handle: sessionUser.handle };
  }
  return { id: 0, name: "You", handle: "@you" };
}

const baseQuery = () =>
  db
    .select({
      ...FEED_COLUMNS,
      channelAvatar: channels.avatarUrl,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id));

export async function getHomeFeed(category?: string): Promise<{
  videos: FeedVideo[];
  shorts: FeedVideo[];
}> {
  await ready();
  const filter = category && category !== "All" ? eq(videos.category, category) : undefined;

  const main = await baseQuery()
    .where(filter ? and(eq(videos.isShort, false), filter) : eq(videos.isShort, false))
    .orderBy(desc(videos.publishedAt))
    .limit(48);

  const shorts = await baseQuery()
    .where(eq(videos.isShort, true))
    .orderBy(desc(videos.views))
    .limit(12);

  return { videos: main, shorts };
}

export async function getShortsFeed(): Promise<FeedVideo[]> {
  await ready();
  return baseQuery().where(eq(videos.isShort, true)).orderBy(desc(videos.views)).limit(20);
}

export async function getCategories(): Promise<string[]> {
  await ready();
  const rows = await db
    .selectDistinct({ category: videos.category })
    .from(videos)
    .orderBy(asc(videos.category));
  return ["All", ...rows.map((r) => r.category).filter((c) => c !== "Shorts")];
}

export async function getVideoById(id: number) {
  await ready();
  const [row] = await baseQuery().where(eq(videos.id, id)).limit(1);
  return row ?? null;
}

export async function getRelatedVideos(video: FeedVideo): Promise<FeedVideo[]> {
  await ready();
  const sameCategory = await baseQuery()
    .where(
      and(
        ne(videos.id, video.id),
        eq(videos.isShort, false),
        eq(videos.category, video.category),
      ),
    )
    .orderBy(desc(videos.views))
    .limit(8);

  const filler = await baseQuery()
    .where(and(ne(videos.id, video.id), eq(videos.isShort, false)))
    .orderBy(desc(videos.publishedAt))
    .limit(20);

  const seen = new Set(sameCategory.map((v) => v.id));
  for (const item of filler) {
    if (seen.size >= 18) break;
    if (!seen.has(item.id)) {
      seen.add(item.id);
      sameCategory.push(item);
    }
  }
  return sameCategory;
}

export async function getViewerVideoState(videoId: number) {
  const me = await getCurrentUser();
  if (!me.id) {
    return { liked: false, disliked: false, saved: false, subscribed: false, progress: 0 };
  }
  const channelId = await getVideoChannelId(videoId);
  const [reaction] = await db
    .select({ kind: reactions.kind })
    .from(reactions)
    .where(and(eq(reactions.userId, me.id), eq(reactions.videoId, videoId)))
    .limit(1);

  const wl = await getPlaylistId(me.id, "WL");
  let saved = false;
  if (wl) {
    const [item] = await db
      .select({ id: playlistItems.id })
      .from(playlistItems)
      .where(and(eq(playlistItems.playlistId, wl), eq(playlistItems.videoId, videoId)))
      .limit(1);
    saved = Boolean(item);
  }

  const [history] = await db
    .select({ progressSec: watchHistory.progressSec })
    .from(watchHistory)
    .where(and(eq(watchHistory.userId, me.id), eq(watchHistory.videoId, videoId)))
    .limit(1);

  return {
    liked: reaction?.kind === "like",
    disliked: reaction?.kind === "dislike",
    saved,
    progress: history?.progressSec ?? 0,
    subscribed: await isSubscribed(me.id, channelId),
  };
}

export async function getVideoChannelId(videoId: number) {
  const [row] = await db
    .select({ channelId: videos.channelId })
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);
  return row?.channelId ?? 0;
}

export async function isSubscribed(userId: number, channelId: number) {
  if (!userId || !channelId) return false;
  const [row] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, channelId)))
    .limit(1);
  return Boolean(row);
}

export async function getSubscriptionState(channelId: number) {
  const me = await getCurrentUser();
  return isSubscribed(me.id, channelId);
}

export async function getComments(videoId: number) {
  await ready();
  return db
    .select()
    .from(comments)
    .where(eq(comments.videoId, videoId))
    .orderBy(desc(comments.pinned), desc(comments.createdAt))
    .limit(60);
}

export async function getChannelBySlug(slug: string) {
  await ready();
  const [row] = await db.select().from(channels).where(eq(channels.slug, slug)).limit(1);
  return row ?? null;
}

export async function getChannelVideos(channelId: number, includeShorts = true) {
  await ready();
  const where = includeShorts
    ? eq(videos.channelId, channelId)
    : and(eq(videos.channelId, channelId), eq(videos.isShort, false));
  return baseQuery().where(where).orderBy(desc(videos.publishedAt));
}

export async function getSubscribedChannels() {
  const me = await getCurrentUser();
  if (!me.id) return [];
  return db
    .select({
      id: channels.id,
      name: channels.name,
      slug: channels.slug,
      handle: channels.handle,
      avatarUrl: channels.avatarUrl,
      accent: channels.accent,
      verified: channels.verified,
    })
    .from(subscriptions)
    .innerJoin(channels, eq(subscriptions.channelId, channels.id))
    .where(eq(subscriptions.userId, me.id))
    .orderBy(asc(channels.name));
}

export async function getSubscriptionsFeed(): Promise<FeedVideo[]> {
  const me = await getCurrentUser();
  await ready();
  const subs = await db
    .select({ channelId: subscriptions.channelId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, me.id));
  if (subs.length === 0) return [];
  return baseQuery()
    .where(
      and(
        eq(videos.isShort, false),
        inArray(
          videos.channelId,
          subs.map((s) => s.channelId),
        ),
      ),
    )
    .orderBy(desc(videos.publishedAt))
    .limit(48);
}

export async function search(query: string) {
  await ready();
  const term = `%${query.trim()}%`;
  if (!query.trim()) return { videos: [] as FeedVideo[], channels: [] as (typeof channels.$inferSelect)[] };
  const found = await baseQuery()
    .where(or(ilike(videos.title, term), ilike(channels.name, term), ilike(videos.category, term)))
    .orderBy(desc(videos.views))
    .limit(40);
  const channelHits = await db
    .select()
    .from(channels)
    .where(or(ilike(channels.name, term), ilike(channels.handle, term)))
    .limit(3);
  return { videos: found, channels: channelHits };
}

export async function getSearchSuggestions(term: string) {
  await ready();
  if (!term.trim()) return [] as string[];
  const rows = await db
    .select({ title: videos.title })
    .from(videos)
    .where(ilike(videos.title, `%${term}%`))
    .orderBy(desc(videos.views))
    .limit(8);
  return rows.map((r) => r.title);
}

async function getPlaylistId(userId: number, slug: string) {
  const [row] = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(and(eq(playlists.userId, userId), eq(playlists.slug, slug)))
    .limit(1);
  return row?.id ?? null;
}

export async function getPlaylist(slug: string) {
  const me = await getCurrentUser();
  await ready();
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.userId, me.id), eq(playlists.slug, slug)))
    .limit(1);
  if (!playlist) return null;
  const items = (await baseQuery()
    .innerJoin(playlistItems, eq(playlistItems.videoId, videos.id))
    .where(eq(playlistItems.playlistId, playlist.id))
    .orderBy(desc(playlistItems.addedAt))) as FeedVideo[];
  return { playlist, videos: items };
}

export async function getUserPlaylists() {
  const me = await getCurrentUser();
  await ready();
  return db
    .select({
      id: playlists.id,
      slug: playlists.slug,
      title: playlists.title,
      visibility: playlists.visibility,
      count: sql<number>`count(${playlistItems.id})::int`,
      thumb: sql<string | null>`min(${videos.thumbnailUrl})`,
    })
    .from(playlists)
    .leftJoin(playlistItems, eq(playlistItems.playlistId, playlists.id))
    .leftJoin(videos, eq(videos.id, playlistItems.videoId))
    .where(eq(playlists.userId, me.id))
    .groupBy(playlists.id)
    .orderBy(asc(playlists.id));
}

export async function getHistory() {
  const me = await getCurrentUser();
  await ready();
  const rows = await db
    .select({ ...FEED_COLUMNS, channelAvatar: channels.avatarUrl, watchedAt: watchHistory.watchedAt, progressSec: watchHistory.progressSec })
    .from(watchHistory)
    .innerJoin(videos, eq(videos.id, watchHistory.videoId))
    .innerJoin(channels, eq(channels.id, videos.channelId))
    .where(eq(watchHistory.userId, me.id))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(50);
  return rows;
}

export async function getLikedVideos() {
  const me = await getCurrentUser();
  await ready();
  return baseQuery()
    .innerJoin(reactions, eq(reactions.videoId, videos.id))
    .where(and(eq(reactions.userId, me.id), eq(reactions.kind, "like")))
    .orderBy(desc(reactions.createdAt));
}

export async function getChannelSection(handle: string) {
  const channel = await getChannelBySlug(handle);
  if (!channel) return null;
  const [allVideos, subscribed] = await Promise.all([
    getChannelVideos(channel.id),
    (async () => {
      const me = await getCurrentUser();
      return isSubscribed(me.id, channel.id);
    })(),
  ]);
  const totalViews = allVideos.reduce((sum, v) => sum + v.views, 0);
  return { channel, videos: allVideos, subscribed, totalViews };
}

export async function getSidebarCounts() {
  const me = await getCurrentUser();
  await ready();
  const [history] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(watchHistory)
    .where(eq(watchHistory.userId, me.id));
  const [liked] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reactions)
    .where(and(eq(reactions.userId, me.id), eq(reactions.kind, "like")));
  return { history: history?.count ?? 0, liked: liked?.count ?? 0 };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function toggleReaction(videoId: number, kind: "like" | "dislike") {
  const me = await getCurrentUser();
  const [existing] = await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.userId, me.id), eq(reactions.videoId, videoId)))
    .limit(1);

  if (!existing) {
    await db.insert(reactions).values({ userId: me.id, videoId, kind });
    return kind;
  }
  if (existing.kind === kind) {
    await db.delete(reactions).where(eq(reactions.id, existing.id));
    return null;
  }
  await db.update(reactions).set({ kind }).where(eq(reactions.id, existing.id));
  return kind;
}

export async function toggleSubscribe(channelId: number) {
  const me = await getCurrentUser();
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, me.id), eq(subscriptions.channelId, channelId)))
    .limit(1);
  if (existing) {
    await db.delete(subscriptions).where(eq(subscriptions.id, existing.id));
    await db
      .update(channels)
      .set({ subscribers: sql`greatest(${channels.subscribers} - 1, 0)` })
      .where(eq(channels.id, channelId));
    return false;
  }
  await db.insert(subscriptions).values({ userId: me.id, channelId });
  await db
    .update(channels)
    .set({ subscribers: sql`${channels.subscribers} + 1` })
    .where(eq(channels.id, channelId));
  return true;
}

export async function toggleWatchLater(videoId: number) {
  const me = await getCurrentUser();
  const playlistId = await getPlaylistId(me.id, "WL");
  if (!playlistId) return false;
  const [existing] = await db
    .select()
    .from(playlistItems)
    .where(and(eq(playlistItems.playlistId, playlistId), eq(playlistItems.videoId, videoId)))
    .limit(1);
  if (existing) {
    await db.delete(playlistItems).where(eq(playlistItems.id, existing.id));
    return false;
  }
  await db.insert(playlistItems).values({ playlistId, videoId });
  return true;
}

export async function addComment(
  videoId: number,
  body: string,
  parentId?: number | null,
) {
  const me = await getCurrentUser();
  const [row] = await db
    .insert(comments)
    .values({
      videoId,
      authorName: me.name,
      authorHandle: me.handle,
      body,
      parentId: parentId ?? null,
    })
    .returning();
  return row;
}

export async function likeComment(commentId: number) {
  const [row] = await db
    .update(comments)
    .set({ likes: sql`${comments.likes} + 1` })
    .where(eq(comments.id, commentId))
    .returning({ likes: comments.likes });
  return row?.likes ?? 0;
}

export async function deleteComment(commentId: number) {
  await db.delete(comments).where(eq(comments.id, commentId));
}

export async function recordView(videoId: number, progressSec: number) {
  const me = await getCurrentUser();
  const [existing] = await db
    .select({ id: watchHistory.id })
    .from(watchHistory)
    .where(and(eq(watchHistory.userId, me.id), eq(watchHistory.videoId, videoId)))
    .limit(1);

  if (!existing) {
    await db.insert(watchHistory).values({ userId: me.id, videoId, progressSec });
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, videoId));
    return;
  }
  await db
    .update(watchHistory)
    .set({ progressSec, watchedAt: new Date() })
    .where(eq(watchHistory.id, existing.id));
}

export async function clearHistory() {
  const me = await getCurrentUser();
  await db.delete(watchHistory).where(eq(watchHistory.userId, me.id));
}

export async function removeHistoryItem(videoId: number) {
  const me = await getCurrentUser();
  await db
    .delete(watchHistory)
    .where(and(eq(watchHistory.userId, me.id), eq(watchHistory.videoId, videoId)));
}

export async function createVideo(input: {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  durationSec: number;
  isShort: boolean;
}) {
  await ready();
  const me = await getCurrentUser();

  // Prefer the signed-in user's own channel (created automatically at signup),
  // so each account's uploads land on its own channel page.
  let channelId: number | null = null;
  if (me.id) {
    const [own] = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.handle, me.handle))
      .limit(1);
    if (own) channelId = own.id;
  }

  // Fall back to the legacy shared "you-studio" channel (pre-auth behavior).
  if (channelId === null) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(channels)
      .where(eq(channels.slug, "you-studio"));

    if (count > 0) {
      const [row] = await db
        .select({ id: channels.id })
        .from(channels)
        .where(eq(channels.slug, "you-studio"))
        .limit(1);
      channelId = row.id;
    } else {
      const [row] = await db
        .insert(channels)
        .values({
          slug: "you-studio",
          name: `${me.name} Studio`,
          handle: "@youstudio",
          description: "Uploads from your own studio.",
          subscribers: 1,
          accent: "#ff0033",
          joinedAt: new Date(),
        })
        .returning({ id: channels.id });
      channelId = row.id;
    }
  }

  const [row] = await db
    .insert(videos)
    .values({
      channelId,
      title: input.title,
      description: input.description,
      videoUrl: input.videoUrl,
      thumbnailUrl: input.thumbnailUrl,
      category: input.category,
      durationSec: input.durationSec,
      isShort: input.isShort,
      views: 0,
      publishedAt: new Date(),
    })
    .returning({ id: videos.id });
  return row.id;
}
