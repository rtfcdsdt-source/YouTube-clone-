import { NextResponse } from "next/server";

// The one-time database setup endpoint has been removed (setup completed
// 2026-10-21). This stub keeps the URL returning 404.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
}
