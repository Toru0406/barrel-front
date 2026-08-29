import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { debugPopular } from "@/lib/ga4";

// Vercel Cron から日次で叩き、GA4人気記事キャッシュ（popular-hero）を再検証する。
// Vercel Cron は CRON_SECRET を Authorization: Bearer で自動付与する。
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get("debug") === "1") {
    return NextResponse.json(await debugPopular());
  }
  revalidateTag("popular-hero");
  return NextResponse.json({ ok: true, revalidated: "popular-hero" });
}
