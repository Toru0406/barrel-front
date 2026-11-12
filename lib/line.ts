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
 * 相談の中心になる語（部位・症状・テーマ）。2026-11-11 追加。
 * 長い語から順に5語へ絞ると1文字の部位が落ちていた（「中学生の息子が練習後に膝が痛いと言います。休ませるべきですか？」で
 * 「膝」が消え、検索には「休ませるべき・中学生・練習後」が使われた）。本文に含まれていれば、長さに関係なく先頭に置く。
 */
const KEY_TERMS = [
  "疲労骨折", "野球肘", "オスグッド", "シンスプリント", "成長痛", "肉離れ", "熱中症", "股関節", "ふくらはぎ",
  "足首", "手首", "太もも", "かかと", "背中", "骨折", "捻挫", "靭帯", "腰痛",
  "肘", "膝", "肩", "腰", "首", "腱",
  "補食", "睡眠", "プロテイン", "筋トレ", "ストレッチ", "成長期", "サプリ", "メンタル", "緊張", "スパイク", "グローブ",
];

/** 検索に使っても意味のない語（言い回し・家族の呼び方など）。2026-11-11 追加 */
const STOP_WORDS = new Set([
  "言っている", "言います", "言ってる", "大丈夫", "いい", "良い", "何", "どう", "どうしたら", "どうすれば", "べき", "思います",
  "息子", "娘", "子ども", "子供", "うちの子", "最近", "ちょっと", "少し", "すごく", "とても",
]);

/** 相談文に含まれる中心語（長い語を優先し、長い語に含まれる短い語は重ねない） */
export function keyTerms(text: string): string[] {
  const hits = KEY_TERMS.filter((t) => text.includes(t));
  return hits.filter((t) => !hits.some((o) => o !== t && o.length > t.length && o.includes(t)));
}

/**
 * 日本語の助詞・記号を落として検索語の候補にする。中心語（keyTerms）を先頭に置き、残りは長い語から。
 * 「肘」「肩」「膝」のような1文字の漢字は相談文の中心語になるので残す
 * （2文字以上に絞ると「肘が痛い」が1件も引けなかった）。
 */
export function tokenize(text: string): string[] {
  const keys = keyTerms(text);
  const stripped = text
    .replace(/[。、．，!！?？「」『』（）()\[\]【】〜~…:：;；"'`]/g, " ")
    .replace(/(です|ます|ました|でしょうか|ですか|ください|したい|について|教えて|べき|は|が|を|に|へ|と|で|の|も|や|から|まで|より)/g, " ");
  const isKanji = (t: string): boolean => /^[一-鿿]$/.test(t);
  const rest = Array.from(new Set(stripped.split(/\s+/).filter((t) => t.length >= 2 || isKanji(t))))
    .filter((t) => !STOP_WORDS.has(t) && !keys.some((k) => k.includes(t) || t.includes(k)))
    .sort((a, b) => b.length - a.length);
  return [...keys, ...rest].slice(0, 5);
}

/** あいさつ・お礼。記事検索にかけると「ありがとう」→「あり」で無関係な記事が返っていた（2026-11-11） */
export function isSmallTalk(text: string): boolean {
  return /^(ありがと|有難|有り難|サンキュー|thanks|thank you|了解|わかりました|分かりました|こんにちは|こんばんは|おはよう|はじめまして|初めまして|よろしく)/i.test(text.trim());
}

export function smallTalkMessages(): Message[] {
  return [textMessage(
    "メッセージありがとうございます。\n" +
    "気になることがあれば、状況をそのまま送ってください。近いテーマの記事をお返しします。",
    true
  )];
}

/**
 * 痛み・ケガの相談か（2026-11-11）。該当すれば、返信の先頭に医療機関を勧める一文を付け、
 * 比較（PR）記事を候補から外す。健康の相談に商品の記事を返すと、相談の答えが「買うこと」に見えてしまうため
 */
export function isPainConsultation(text: string): boolean {
  return /痛|腫れ|はれ|しびれ|痺れ|ケガ|怪我|けが|骨折|捻挫|ねんざ|肉離れ|違和感|熱中症|オスグッド|野球肘|シンスプリント/.test(text);
}

const PAIN_CAUTION =
  "痛みが続く、腫れがある、動かすと悪化するといったときは、記事より先に医療機関（整形外科など）で診てもらってください。\n" +
  "記事は一般的な知見をまとめたもので、診断の代わりにはなりません。";

/** 比較（PR）記事か。トップページと同じく「道具・サプリの選び方」ハブのカテゴリで見る */
function isComparisonPost(post: WPPost): boolean {
  const ids = HUBS.find((h) => h.id === "gear-supplement")?.wpCategoryIds ?? [];
  return post.categories.some((id) => ids.includes(id));
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
/** これ未満の一致度の記事は返さない（2026-11-11）。題名に語が1つ出れば3点、要約だけなら1点 */
const MIN_RELEVANCE = 2;

/** 記事を一致度で選ぶ（通信しない）。中心語があるなら、題名か要約にそのどれかを含む記事だけにする */
export function rankArticles(posts: WPPost[], text: string, opts: { excludeComparison?: boolean } = {}): WPPost[] {
  const tokens = tokenize(text);
  const keys = keyTerms(text);
  return posts
    .filter((p) => !(opts.excludeComparison && isComparisonPost(p)))
    .filter((p) => keys.length === 0 || keys.some((k) => plain(p.title.rendered).includes(k) || excerptText(p).includes(k)))
    .map((p) => ({ post: p, score: relevance(p, tokens) }))
    .filter((x) => x.score >= MIN_RELEVANCE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CARDS)
    .map((x) => x.post);
}

export async function pickArticles(text: string, opts: { excludeComparison?: boolean } = {}): Promise<WPPost[]> {
  const hub = matchHub(text);
  if (hub) {
    const r = await getPostsByCategoryIds(hub.wpCategoryIds, { perPage: MAX_CARDS * 2 }).catch(() => null);
    const posts = (r?.posts ?? []).filter((p) => !(opts.excludeComparison && isComparisonPost(p)));
    if (posts.length > 0) return posts.slice(0, MAX_CARDS);
  }

  const tokens = tokenize(text);
  const queries = [text.slice(0, 60), ...tokens.slice(0, 3)];
  const found = new Map<number, WPPost>();
  for (const q of queries) {
    const r = await searchPosts(q).catch(() => null);
    for (const p of r?.posts ?? []) found.set(p.id, p);
  }
  if (found.size === 0) return [];
  // ★以前は一致度0点の記事も「近いテーマの記事です」として返していた。基準に届かなければ「見つからない」と返す
  return rankArticles(Array.from(found.values()), text, opts);
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

/** 相談文への応答を組み立てる（通信しない。テストしやすいよう純粋関数にしてある）。pain なら先頭に医療機関の一文 */
export function buildReply(posts: WPPost[], opts: { pain?: boolean } = {}): Message[] {
  const caution = opts.pain ? [textMessage(PAIN_CAUTION)] : [];
  if (posts.length === 0) {
    return [...caution, textMessage(
      "近いテーマの記事を見つけられませんでした。\n" +
      "部位・年代・場面など、もう少し具体的な言葉で送っていただくか、下のテーマから選んでください。",
      true
    )];
  }
  return [
    ...caution,
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
