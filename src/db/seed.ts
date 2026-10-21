import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  channels,
  comments,
  playlistItems,
  playlists,
  subscriptions,
  users,
  videos,
  watchHistory,
} from "@/db/schema";
import { seedChannels, seedComments, seedVideos } from "@/db/seed-data";

const LOCK_KEY = 918273645;
let seedPromise: Promise<void> | null = null;

const COMMENTERS = [
  ["Priya Raman", "@priyabuilds"],
  ["Marcus Vale", "@marcusvale"],
  ["Dana K.", "@danak"],
  ["TheOpenWindow", "@theopenwindow"],
  ["Sam Oyelaran", "@samoyelaran"],
  ["n0va_dev", "@n0va_dev"],
  ["Kelsey Bloom", "@kelseybloom"],
  ["Rahul Mehta", "@rahulmehta"],
  ["quietframes", "@quietframes"],
  ["Tomasz W.", "@tomaszw"],
  ["Amara Diallo", "@amaradiallo"],
  ["late_night_dev", "@late_night_dev"],
] as const;

function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - days * 86_400_000 - hours * 3_600_000);
}

async function seed() {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${LOCK_KEY})`);

    const existing = await tx.select({ id: channels.id }).from(channels).limit(1);
    if (existing.length > 0) return;

    // Channels -------------------------------------------------------------
    const channelRows = await tx
      .insert(channels)
      .values(
        seedChannels.map((c, i) => ({
          slug: c.slug,
          name: c.name,
          handle: c.handle,
          description: c.description,
          subscribers: c.subscribers,
          verified: c.verified,
          country: c.country,
          accent: c.accent,
          bannerUrl: null,
          avatarUrl: null,
          joinedAt: daysAgo(1400 + i * 130),
        })),
      )
      .returning({ id: channels.id, slug: channels.slug });

    const bySlug = new Map(channelRows.map((row) => [row.slug, row.id]));

    // Videos ---------------------------------------------------------------
    const videoValues: (typeof videos.$inferInsert)[] = [];
    for (const [slug, list] of Object.entries(seedVideos)) {
      const channelId = bySlug.get(slug);
      if (!channelId) continue;
      for (const v of list) {
        videoValues.push({
          channelId,
          title: v.t,
          description: `${v.t}\n\nIn this video we take the long way around and show every step — what worked, what absolutely did not, and the settings I'd change next time.\n\nChapters\n00:00 Intro\n00:12 The setup\n00:28 Main segment\n00:44 What I'd do differently\n00:58 Final thoughts\n\nThanks for watching — subscribe for a new upload every week.\n\n#${slug} #creator #4k`,
          thumbnailUrl: v.th,
          videoUrl: v.v,
          durationSec: v.d,
          views: v.views,
          category: v.isShort ? "Shorts" : categoryForSlug(slug),
          isShort: Boolean(v.isShort),
          isLive: Boolean(v.isLive),
          publishedAt: daysAgo(v.days, (v.views % 20) + 1),
        });
      }
    }

    const videoRows = await tx
      .insert(videos)
      .values(videoValues)
      .returning({ id: videos.id, isShort: videos.isShort, views: videos.views });

    // Demo account ---------------------------------------------------------
    const [me] = await tx
      .insert(users)
      .values({
        handle: "@you",
        name: "You",
        email: "you@example.com",
      })
      .returning({ id: users.id });

    // Subscriptions --------------------------------------------------------
    const subSlugs = [
      "spiceandflame",
      "devtheory",
      "nomadicframes",
      "livewiremusic",
      "wildearth",
      "loopdaily",
    ];
    await tx.insert(subscriptions).values(
      subSlugs.map((slug, i) => ({
        userId: me.id,
        channelId: bySlug.get(slug)!,
        createdAt: daysAgo(90 - i * 9),
        bell: i % 3 === 0 ? "all" : "personalized",
      })),
    );

    // Comments -------------------------------------------------------------
    const commentValues: (typeof comments.$inferInsert)[] = [];
    videoRows.forEach((video, index) => {
      const count = 3 + (index % 3);
      for (let i = 0; i < count; i += 1) {
        const [name, handle] = COMMENTERS[(index * 3 + i) % COMMENTERS.length];
        commentValues.push({
          videoId: video.id,
          authorName: name,
          authorHandle: handle,
          body: seedComments[(index * 2 + i) % seedComments.length],
          likes: ((index * 137 + i * 53) % 4200) + 4,
          pinned: i === 0 && index % 4 === 0,
          hearted: i === 0 && index % 5 === 0,
          createdAt: daysAgo((index % 11) + i, i * 5),
        });
      }
    });
    await tx.insert(comments).values(commentValues);

    // Watch later + liked playlists ---------------------------------------
    const playlistRows = await tx
      .insert(playlists)
      .values([
        { userId: me.id, slug: "WL", title: "Watch later", visibility: "private" },
        { userId: me.id, slug: "LL", title: "Liked videos", visibility: "private" },
        {
          userId: me.id,
          slug: "weekend-binge",
          title: "Weekend binge",
          visibility: "public",
        },
      ])
      .returning({ id: playlists.id, slug: playlists.slug });

    const playlistBySlug = new Map(playlistRows.map((p) => [p.slug, p.id]));
    const longForm = videoRows.filter((v) => !v.isShort);

    await tx.insert(playlistItems).values([
      ...longForm.slice(0, 5).map((v) => ({
        playlistId: playlistBySlug.get("WL")!,
        videoId: v.id,
      })),
      ...longForm.slice(5, 9).map((v) => ({
        playlistId: playlistBySlug.get("LL")!,
        videoId: v.id,
      })),
      ...longForm.slice(9, 15).map((v) => ({
        playlistId: playlistBySlug.get("weekend-binge")!,
        videoId: v.id,
      })),
    ]);

    // A little watch history so the History page is alive ------------------
    await tx.insert(watchHistory).values(
      longForm.slice(0, 7).map((v, i) => ({
        userId: me.id,
        videoId: v.id,
        progressSec: Math.floor(v.views % 40),
        watchedAt: daysAgo(i, 3 + i),
      })),
    );
  });
}

function categoryForSlug(slug: string) {
  switch (slug) {
    case "nomadicframes":
      return "Travel";
    case "urbanpulse":
      return "City";
    case "spiceandflame":
      return "Cooking";
    case "devtheory":
      return "Coding";
    case "livewiremusic":
      return "Music";
    case "wildearth":
      return "Wildlife";
    default:
      return "Vlogs";
  }
}

export function ensureSeed() {
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
