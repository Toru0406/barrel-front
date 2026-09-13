import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { GA4_POPULAR_TAG } from "@/lib/ga4";

// Vercel Cron から日次で叩き、ホーム（GA4人気ヒーロー）を再生成する。
// Vercel Cron は CRON_SECRET を Authorization: Bearer で自動付与する。
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  // GA4ランキングの共有キャッシュ（人気レール・人気印の両方が参照）を先に破棄する
  revalidateTag(GA4_POPULAR_TAG);
  revalidatePath("/");
  return NextResponse.json({ ok: true, revalidated: "/", tag: GA4_POPULAR_TAG });
}
