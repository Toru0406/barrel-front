import { NextResponse } from "next/server";
import {
  verifySignature, pickArticles, buildReply, welcomeMessages,
  isHelpRequest, helpMessages, reply, type LineEvent,
} from "@/lib/line";

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
      if (event.type === "follow") {
        await reply(event.replyToken, welcomeMessages(), accessToken);
        handled++;
      } else if (event.type === "message" && event.message?.type === "text") {
        const text = (event.message.text ?? "").trim();
        if (!text) continue;
        // リッチメニューの「使い方」ボタンはこの語を送ってくる。記事検索にかけても意味がない
        const messages = isHelpRequest(text) ? helpMessages() : buildReply(await pickArticles(text));
        await reply(event.replyToken, messages, accessToken);
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
