import crypto from "node:crypto";
import { getPostsByCategoryIds, searchPosts, excerptText, type WPPost } from "@/lib/wordpress";
import { HUBS } from "@/lib/hubs";

/**
 * LINE公式アカウントの応答まわり。
 *
 * 無料プラン（コミュニケーションプラン）の配信は月200通で、通数は「配信回数 × 友だち数」で数える。
 * 一方 **応答メッセージ（リプライ）は通数にカウントされない**（LINE公式ドキュメントで明記）。
 * つまり友だちが増えても応答はタダで無制限に打てる。BARRELは研究ベースの記事を資産として
 * 持っているので、「配信で押し込む」のではなく「聞かれたら該当記事を返す」側に寄せる。
 *
 * ここには通信を伴わない純粋な組み立て・判定を置き、Webhookのルートからは副作用だけを呼ぶ。
 */

const REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply";
const SITE = "https://www.getabarrel.com";
const MAX_CARDS = 3;

const plain = (html: string): string => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export interface LineEvent {
  type: string;
  replyToken?: string;
  message?: { type: string; text?: string };
}

/** 署名検証。LINEはリクエストボディのHMAC-SHA256をBase64にしたものを x-line-signature に入れる */
export function verifySignature(rawBody: string, signature: string | null, channelSecret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", channelSecret).update(rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  // 長さが違うと timingSafeEqual が例外を投げるので先に弾く
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * 日本語の助詞・記号を落として検索語の候補にする。長い語ほど効くので降順。
 * 「肘」「肩」「膝」のような1文字の漢字は相談文の中心語になるので残す
 * （2文字以上に絞ると「肘が痛い」が1件も引けなかった）。
 */
export function tokenize(text: string): string[] {
  const stripped = text
    .replace(/[。、．，!！?？「」『』（）()\[\]【】〜~…:：;；"'`]/g, " ")
    .replace(/(です|ます|ました|でしょうか|ですか|ください|したい|について|教えて|は|が|を|に|へ|と|で|の|も|や|から|まで|より)/g, " ");
  const isKanji = (t: string): boolean => /^[一-鿿]$/.test(t);
  return Array.from(new Set(stripped.split(/\s+/).filter((t) => t.length >= 2 || isKanji(t))))
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);
}

/** 本文がハブ名・短縮名を指していればそのハブを返す */
export function matchHub(text: string): (typeof HUBS)[number] | null {
  return HUBS.find((h) => text.includes(h.label) || text.includes(h.short)) ?? null;
}

/** 検索語が本文に何回現れるかで並べ替える。WPの既定の検索は関連度が弱く、
 * 「練習後の補食」でストレッチの記事が先頭に来ていた */
function relevance(post: WPPost, tokens: string[]): number {
  const title = plain(post.title.rendered);
  const body = excerptText(post);
  return tokens.reduce((score, t) => score + (title.includes(t) ? 3 : 0) + (body.includes(t) ? 1 : 0), 0);
}

/**
 * 相談文から返す記事を決める。
 * ハブ名そのものが来たらそのハブの新着、それ以外は全文検索と語ごとの検索を合わせ、
 * 検索語の出現で採点して上位を返す。
 * LLMは使わない（応答が無料なのに推論コストを乗せる意味がなく、応答を待たせたくないため）。
 */
export async function pickArticles(text: string): Promise<WPPost[]> {
  const hub = matchHub(text);
  if (hub) {
    const r = await getPostsByCategoryIds(hub.wpCategoryIds, { perPage: MAX_CARDS }).catch(() => null);
    if (r && r.posts.length > 0) return r.posts.slice(0, MAX_CARDS);
  }

  const tokens = tokenize(text);
  const queries = [text.slice(0, 60), ...tokens.slice(0, 3)];
  const found = new Map<number, WPPost>();
  for (const q of queries) {
    const r = await searchPosts(q).catch(() => null);
    for (const p of r?.posts ?? []) found.set(p.id, p);
  }
  if (found.size === 0) return [];

  return Array.from(found.values())
    .map((p) => ({ post: p, score: relevance(p, tokens) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CARDS)
    .map((x) => x.post);
}

type Message = Record<string, unknown>;

const truncate = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** 記事カード（Flexのカルーセル）。altTextはトーク一覧に出る短い説明 */
export function articleCarousel(posts: WPPost[]): Message {
  return {
    type: "flex",
    altText: truncate(`該当しそうな記事を${posts.length}本お送りしました`, 100),
    contents: {
      type: "carousel",
      contents: posts.map((p) => {
        const title = plain(p.title.rendered);
        return {
          type: "bubble",
          size: "kilo",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              { type: "text", text: truncate(title, 60), weight: "bold", size: "sm", wrap: true, maxLines: 3 },
              { type: "text", text: truncate(excerptText(p), 90), size: "xs", color: "#5F6B64", wrap: true, maxLines: 3 },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "button",
              style: "primary",
              height: "sm",
              color: "#14201A",
              action: { type: "uri", label: "記事を読む", uri: `${SITE}/articles/${p.slug}` },
            }],
          },
        };
      }),
    },
  };
}

/** ハブを選ばせるクイックリプライ。ボタンを押すとその語がそのまま送信される */
export function hubQuickReply(): Record<string, unknown> {
  return {
    items: HUBS.map((h) => ({
      type: "action",
      action: { type: "message", label: truncate(h.short, 20), text: h.label },
    })),
  };
}

export function textMessage(text: string, withQuickReply = false): Message {
  const msg: Message = { type: "text", text };
  if (withQuickReply) msg.quickReply = hubQuickReply();
  return msg;
}

/** リッチメニューの「使い方」やヘルプ的な問いかけ。記事検索にかけても意味がないので先に拾う */
export function isHelpRequest(text: string): boolean {
  return /^(使い方|ヘルプ|help|つかいかた|このアカウント)/i.test(text.trim());
}

/**
 * 「使い方」への応答。応答メッセージなので通数を消費しない。
 *
 * 文面は LINE Official Account Manager のあいさつメッセージに登録したものと同じにしてある。
 * 友だち追加時のあいさつは管理画面側が送るので、こちらは follow イベントに応答しない
 * （両方が送ると新規の友だちに二重で届く）。管理画面の文面を直したら、ここも合わせること。
 */
export function helpMessages(): Message[] {
  return [
    textMessage(
      "使い方はかんたんです。\n" +
      "困っていることをそのまま送ってください。近いテーマの記事をお返しします🚩\n" +
      "例）・肘が痛いと言っている　・成長期に筋トレをさせて大丈夫？　・練習後の補食は何がいい？"
    ),
    textMessage(
      "下のメニューからテーマで探すこともできます。\n" +
      "練習・指導／身体づくり／障害予防／運営・保護者／道具・サプリ\n" +
      "※本記事はあくまで一般的な知見に基づく内容ですので、参考にとどめていただき、ケガや痛みの判断が必要なときは、必ず医療機関や専門家にご相談ください。",
      true
    ),
  ];
}

/** 相談文への応答を組み立てる（通信しない。テストしやすいよう純粋関数にしてある） */
export function buildReply(posts: WPPost[]): Message[] {
  if (posts.length === 0) {
    return [textMessage(
      "うまく見つけられませんでした。\n" +
      "もう少し具体的な言葉（部位・年代・場面など）で送っていただくか、下のテーマから選んでください。",
      true
    )];
  }
  return [
    textMessage("近いテーマの記事です。"),
    { ...articleCarousel(posts), quickReply: hubQuickReply() },
  ];
}

/** 応答メッセージを送る。replyToken は1回しか使えない */
export async function reply(replyToken: string, messages: Message[], accessToken: string): Promise<void> {
  const res = await fetch(REPLY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ replyToken, messages: messages.slice(0, 5) }),
  });
  if (!res.ok) {
    // 応答の失敗でWebhookを500にするとLINEがリトライし、同じreplyTokenで二重に失敗する
    console.error(`[line] reply失敗 HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}
