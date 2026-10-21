import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import { channels, users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeHandle(raw: string): string {
  let h = raw.trim();
  if (!h.startsWith("@")) h = `@${h}`;
  return h.toLowerCase();
}

async function uniqueChannelSlug(base: string): Promise<string> {
  let slug = base.replace(/^@/, "").replace(/[^a-z0-9]+/g, "").slice(0, 30) || "channel";
  let candidate = slug;
  let i = 1;
  for (;;) {
    const [row] = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.slug, candidate))
      .limit(1);
    if (!row) return candidate;
    candidate = `${slug}${i++}`;
  }
}

export async function POST(request: Request) {
  await ensureSeed();
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    handle?: string;
    email?: string;
    password?: string;
  };

  const name = (body.name ?? "").trim().slice(0, 50);
  const email = (body.email ?? "").trim().toLowerCase();
  const handle = normalizeHandle(body.handle ?? "");
  const password = body.password ?? "";

  if (!name) return Response.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (handle.length < 2 || !/^@[a-z0-9_]+$/.test(handle))
    return Response.json(
      { ok: false, error: "Handle must be @ followed by letters, numbers or _." },
      { status: 400 },
    );
  if (password.length < 6)
    return Response.json(
      { ok: false, error: "Password must be at least 6 characters." },
      { status: 400 },
    );

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email), eq(users.handle, handle)))
    .limit(1);
  if (taken)
    return Response.json(
      { ok: false, error: "That email or handle is already taken." },
      { status: 409 },
    );

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ name, handle, email, passwordHash })
    .returning({ id: users.id, name: users.name, handle: users.handle, email: users.email });

  // Every account gets its own channel, like YouTube does on signup.
  const slug = await uniqueChannelSlug(handle);
  await db.insert(channels).values({
    slug,
    name,
    handle,
    description: "",
    subscribers: 0,
    joinedAt: new Date(),
  });

  await createSession(user.id);
  return Response.json({ ok: true, user });
}
