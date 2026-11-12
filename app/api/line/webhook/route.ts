import { NextResponse } from "next/server";
import {
  verifySignature, pickArticles, buildReply,
  isHelpRequest, helpMessages, isSmallTalk, smallTalkMessages, isPainConsultation, matchHub, reply, type LineEvent,
} from "@/lib/line";
import { recordLineQuery, type LineQueryKind } from "@/lib/lineLog";

// LINE公式アカウントのWebhook。ユーザーの発話に「応答メッセージ」で返す。
// 応答は料金プランの通数にカウントされないため、無料プラン（月200通）でも無制限に使える。
//
// LINEは2xx以外を返すとリトライしてくるので、処理に失敗しても200を返す（二重応答を避けるため、
// replyToken は使い捨てであることに注意）。署名が合わない場合だけ401を返す。
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // 署名検証に node:crypto を使う

export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !accessToken) {
    console.error("[line] LINE_CHANNEL_SECRET / LINE_CHANNEL_ACCESS_TOKEN が未設定");
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 署名はリクエストボディのバイト列に対して計算されるので、パースする前に生テキストで受ける
  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-line-signature"), secret)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let events: LineEvent[] = [];
  try {
    events = (JSON.parse(rawBody) as { events?: LineEvent[] }).events ?? [];
  } catch {
    return NextResponse.json({ ok: true, handled: 0 });
  }

  let handled = 0;
  for (const event of events) {
    if (!event.replyToken) continue;
    try {
      // follow（友だち追加・ブロック解除）には応答しない。あいさつは LINE Official Account Manager の
      // あいさつメッセージが送るので、ここでも返すと新規の友だちに二重で届く
      if (event.type === "message" && event.message?.type === "text") {
        const text = (event.message.text ?? "").trim();
        if (!text) continue;
        // リッチメニューの「使い方」ボタンはこの語を送ってくる。記事検索にかけても意味がない
        // あいさつ・お礼は記事検索にかけない。痛み・ケガの相談は医療機関の一文を付け、比較（PR）記事を返さない（2026-11-11）
        const pain = isPainConsultation(text);
        const kind: LineQueryKind = isHelpRequest(text) ? "help" : isSmallTalk(text) ? "smalltalk" : matchHub(text) ? "hub" : "search";
        const posts = kind === "search" || kind === "hub" ? await pickArticles(text, { excludeComparison: pain }) : [];
        const messages = kind === "help" ? helpMessages()
          : kind === "smalltalk" ? smallTalkMessages()
          : buildReply(posts, { pain });
        await reply(event.replyToken, messages, accessToken);
        // 何を聞かれ、記事を返せたかを残す（ユーザーIDは保存しない。返信の後に行い、失敗しても返信には影響しない）
        await recordLineQuery({ kind, text, pain, slugs: posts.map((p) => p.slug) });
        handled++;
      }
    } catch (e) {
      console.error("[line] イベント処理に失敗:", (e as Error).message);
    }
  }

  return NextResponse.json({ ok: true, handled });
}

// LINE Developers コンソールの「検証」ボタンや疎通確認用。設定状況だけ返す（値は返さない）
export function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.LINE_CHANNEL_SECRET && process.env.LINE_CHANNEL_ACCESS_TOKEN),
  });
}
