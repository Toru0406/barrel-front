// 2026-10-12 に WordPress（cms.getabarrel.com / Hetzner）を廃止し、記事の保管庫を Supabase に移した。
// 画面側を変えないよう、返す形（WPPost / WPCategory）と関数名は WP REST 時代のまま。
// 読むのは anon キー＋RLS（公開記事だけ見える）。キャッシュは WP 時代と同じく fetch の revalidate で持つ。

export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: { width: number; height: number };
    }>;
    "wp:term"?: Array<WPCategory[]>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
  description: string;
}

interface PostRow {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category_ids: number[];
  featured_image_url: string | null;
  featured_image_alt: string;
  date: string;
  modified: string;
}

type CategoryRow = Omit<WPCategory, "count">;

const POST_FIELDS = "id,slug,title,content,excerpt,category_ids,featured_image_url,featured_image_alt,date,modified";

function supabaseEnv(): { url: string; key: string } {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定");
  return { url, key };
}

async function rest<T>(query: string, opts: { count?: boolean } = {}): Promise<{ rows: T; total: number }> {
  const { url, key } = supabaseEnv();
  const res = await fetch(`${url}/rest/v1/${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...(opts.count ? { Prefer: "count=exact" } : {}) },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Supabase API error: ${res.status} ${query.split("?")[0]}`);
  // Content-Range: 0-11/56 の "/" 以降が総数
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
  return { rows: (await res.json()) as T, total };
}

async function categoryRows(): Promise<CategoryRow[]> {
  return (await rest<CategoryRow[]>("categories?select=id,name,slug,parent,description&order=id")).rows;
}

function toWPPost(p: PostRow, cats: Map<number, CategoryRow>): WPPost {
  const terms = p.category_ids.map((id) => cats.get(id)).filter((c): c is CategoryRow => Boolean(c)).map((c) => ({ ...c, count: 0 }));
  return {
    id: p.id,
    date: p.date,
    modified: p.modified,
    slug: p.slug,
    link: `https://www.getabarrel.com/articles/${p.slug}`,
    title: { rendered: p.title },
    content: { rendered: p.content },
    excerpt: { rendered: p.excerpt },
    featured_media: p.featured_image_url ? 1 : 0,
    categories: p.category_ids,
    _embedded: {
      ...(p.featured_image_url ? { "wp:featuredmedia": [{ source_url: p.featured_image_url, alt_text: p.featured_image_alt }] } : {}),
      "wp:term": [terms],
    },
  };
}

async function listPosts(filter: string, page: number, perPage: number): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const offset = (page - 1) * perPage;
  const [{ rows, total }, cats] = await Promise.all([
    rest<PostRow[]>(`posts?select=${POST_FIELDS}&status=eq.publish${filter}&order=date.desc&limit=${perPage}&offset=${offset}`, { count: true }),
    categoryRows(),
  ]);
  const byId = new Map(cats.map((c) => [c.id, c]));
  return { posts: rows.map((p) => toWPPost(p, byId)), total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/**
 * URL の slug を保存時の形（小文字のパーセントエンコード。WP の sanitize_title と同じ）にそろえる。
 * ブラウザは大文字（%E9）で、Google やSNSに残るリンクは小文字（%e9）で来るため、どちらでも同じ記事に当てる。
 */
export function normalizeSlug(raw: string): string {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // 壊れたエンコードはそのまま
  }
  return encodeURIComponent(decoded).toLowerCase();
}

export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  categoryId?: number;
}): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 12, categoryId } = params ?? {};
  return listPosts(categoryId ? `&category_ids=cs.{${categoryId}}` : "", page, perPage);
}

/** 複数カテゴリID で記事を取得（いずれかのカテゴリに入っていれば対象。WP の categories=1,2,3 と同じOR検索） */
export async function getPostsByCategoryIds(
  ids: number[],
  opts: { page?: number; perPage?: number } = {}
): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 12 } = opts;
  return listPosts(`&category_ids=ov.{${ids.join(",")}}`, page, perPage);
}

/** 全文検索（タイトルと本文の部分一致） */
export async function searchPosts(
  q: string,
  page = 1
): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  // PostgREST の or=() 構文を壊す記号は落とす
  const term = q.replace(/[,()"*\\]/g, " ").trim();
  if (!term) return { posts: [], total: 0, totalPages: 1 };
  const pattern = encodeURIComponent(`"*${term}*"`);
  return listPosts(`&or=(title.ilike.${pattern},content.ilike.${pattern})`, page, 12);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const key = normalizeSlug(slug);
  const [{ rows }, cats] = await Promise.all([
    rest<PostRow[]>(`posts?select=${POST_FIELDS}&status=eq.publish&slug=eq.${encodeURIComponent(key)}&limit=1`),
    categoryRows(),
  ]);
  return rows[0] ? toWPPost(rows[0], new Map(cats.map((c) => [c.id, c]))) : null;
}

/** hideEmpty=true（既定）は記事0件のカテゴリを除外。ナビ生成では構造維持のため false で呼ぶ。 */
export async function getCategories(opts?: { hideEmpty?: boolean }): Promise<WPCategory[]> {
  const hideEmpty = opts?.hideEmpty ?? true;
  const [cats, { rows }] = await Promise.all([
    categoryRows(),
    rest<Array<{ category_ids: number[] }>>("posts?select=category_ids&status=eq.publish"),
  ]);
  const counts = new Map<number, number>();
  for (const r of rows) for (const id of r.category_ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return cats
    .map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))
    .filter((c) => !hideEmpty || c.count > 0);
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cats = await getCategories({ hideEmpty: false });
  return cats.find((c) => c.slug === slug) ?? null;
}

export function getFeaturedImage(post: WPPost): { src: string; alt: string } | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return { src: media.source_url, alt: media.alt_text || "" };
}

export function getPostCategories(post: WPPost): WPCategory[] {
  return post._embedded?.["wp:term"]?.[0] ?? [];
}

/** WP の modified フィールドから更新日を返す（modified が空なら date を使う） */
export function getModifiedDate(post: WPPost): string {
  return post.modified || post.date;
}

/**
 * PR（広告・アフィリエイトを含む）記事かを本文から判定する。
 * カード一覧で記事を開く前にPRと分かるようにするための判定で、以下のいずれかで真。
 *  1. 本文冒頭のPR表記段落 <p class="barrel-pr">（記事側の明示。lib/article.ts が読み飛ばす要素）
 *  2. アフィリエイトリンク（af.moshimo.com / amazon.co.jp）。lib/article.ts が rel="sponsored" を付ける条件と同じ
 *  3. 商品ボックス（.barrel-picks / .barrel-product。theme-engine の productBox.ts が生成する購入導線）
 * 判定は「迷ったら付ける」側に倒す。表示漏れの方がコストが高いため。
 */
export function isSponsored(post: WPPost): boolean {
  const html = post.content?.rendered ?? "";
  return (
    /<p[^>]*class=["'][^"']*barrel-pr[^"']*["']/i.test(html) ||
    /href=["'][^"']*af\.moshimo\.com/i.test(html) ||
    /href=["']https?:\/\/(?:www\.)?amazon\.co\.jp\//i.test(html) ||
    /class=["'][^"']*barrel-(?:picks|product)[^"']*["']/i.test(html)
  );
}

/**
 * 参考文献の外部リンク数を出典数として返す。
 * 「参考文献」を含む h2/h3 以降の <a href> を数える。
 * 該当セクションがなければ本文全体の外部リンク数（http:// or https://）を数える。
 */
export function evidenceCount(post: WPPost): number {
  const html = post.content?.rendered ?? "";

  // 「参考文献」セクションを探す
  const refMatch = html.match(/<h[23][^>]*>[^<]*参考文献[^<]*<\/h[23]>([\s\S]*)$/i);
  if (refMatch) {
    const section = refMatch[1];
    return (section.match(/<a\s[^>]*href=/gi) ?? []).length;
  }

  // セクションなし: 本文の外部リンクをカウント
  const externalLinks = html.match(/<a\s[^>]*href=["']https?:\/\//gi) ?? [];
  return externalLinks.length;
}

/**
 * リード段落（先頭の <p> で .barrel-pr でないもの）をプレーンテキストで返す（最大160文字）。
 * Google Discover の description 用。
 */
export function leadParagraph(post: WPPost): string {
  const html = post.content?.rendered ?? "";
  // barrel-pr クラスを持つ段落を除外
  const pPattern = /<p(?![^>]*barrel-pr)[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pPattern.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 0) {
      return text.slice(0, 160);
    }
  }
  return "";
}

/** excerpt のタグを除去してプレーンテキストを返す */
export function excerptText(post: WPPost): string {
  return (post.excerpt?.rendered ?? "").replace(/<[^>]+>/g, "").trim();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** CMS(barrel-theme) と同じ「YYYY.MM.DD」表記 */
export function formatDateDot(dateStr: string): string {
  const d = new Date(dateStr);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 本文文字数からおおよその読了時間（分）を算出。CMSの「X分で読める」表記に合わせる。 */
export function readingTimeMin(post: WPPost): number {
  const text = post.content?.rendered?.replace(/<[^>]+>/g, "") ?? "";
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}
