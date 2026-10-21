import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Returns the logged-in user, or { user: null } when logged out. */
export async function GET() {
  const user = await getSessionUser();
  return Response.json({ user });
}
