import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password)
    return Response.json({ ok: false, error: "Email and password are required." }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Same generic message whether the email or password is wrong (no user enumeration).
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user.id);
  return Response.json({
    ok: true,
    user: { id: user.id, name: user.name, handle: user.handle, email: user.email },
  });
}
