import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  description: text("description").notNull().default(""),
  subscribers: integer("subscribers").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  country: text("country").notNull().default("United States"),
  accent: text("accent").notNull().default("#ff0033"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const videos = pgTable(
  "videos",
  {
    id: serial("id").primaryKey(),
    channelId: integer("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    thumbnailUrl: text("thumbnail_url").notNull(),
    videoUrl: text("video_url").notNull(),
    durationSec: integer("duration_sec").notNull().default(0),
    views: integer("views").notNull().default(0),
    category: text("category").notNull().default("All"),
    isShort: boolean("is_short").notNull().default(false),
    isLive: boolean("is_live").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("videos_channel_idx").on(table.channelId)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // Null for legacy/seeded demo accounts; set for accounts created via signup.
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
});

// Server-side login sessions. One row per active login; the token is stored
// in an httpOnly `session` cookie (see src/lib/auth.ts).
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_token_idx").on(table.token)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channelId: integer("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    bell: text("bell").notNull().default("all"),
  },
  (table) => [uniqueIndex("subs_unique_idx").on(table.userId, table.channelId)],
);

export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // "like" | "dislike"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("reactions_unique_idx").on(table.userId, table.videoId)],
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    authorHandle: text("author_handle").notNull(),
    authorAvatar: text("author_avatar"),
    body: text("body").notNull(),
    likes: integer("likes").notNull().default(0),
    parentId: integer("parent_id"),
    pinned: boolean("pinned").notNull().default(false),
    hearted: boolean("hearted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("comments_video_idx").on(table.videoId)],
);

export const watchHistory = pgTable(
  "watch_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    progressSec: integer("progress_sec").notNull().default(0),
    watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("history_unique_idx").on(table.userId, table.videoId)],
);

export const playlists = pgTable(
  "playlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    visibility: text("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("playlists_unique_idx").on(table.userId, table.slug)],
);

export const playlistItems = pgTable(
  "playlist_items",
  {
    id: serial("id").primaryKey(),
    playlistId: integer("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("playlist_items_unique_idx").on(table.playlistId, table.videoId)],
);

export type Channel = typeof channels.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Comment = typeof comments.$inferSelect;
