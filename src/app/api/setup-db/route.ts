import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureSeed } from "@/db/seed";
import { AUTH_SQL, SCHEMA_SQL } from "./sql";

// One-time setup endpoint: creates tables (idempotent guards in SQL) and
// seeds demo data. Guarded by the SETUP_PIN env var; remove after use.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const pin = process.env.SETUP_PIN;
  if (!pin || req.headers.get("x-setup-pin") !== pin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  try {
    await pool.query(SCHEMA_SQL);
    await pool.query(AUTH_SQL);
    await ensureSeed();
    const v = await pool.query("select count(*)::int as c from videos");
    const u = await pool.query("select count(*)::int as c from users");
    return NextResponse.json({
      ok: true,
      videos: v.rows[0].c,
      users: u.rows[0].c,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
