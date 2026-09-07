const WP_BASE = process.env.WORDPRESS_API_URL || "https://cms.getabarrel.com/wp-json/wp/v2";

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

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  categoryId?: number;
}): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 12, categoryId } = params ?? {};
  const qs = new URLSearchParams({
    _embed: "1",
    per_page: String(perPage),
    page: String(page),
  });
  if (categoryId) qs.set("categories", String(categoryId));

  const res = await fetch(`${WP_BASE}/posts?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);

  const posts = (await res.json()) as WPPost[];
  return {
    posts,
    total: Number(res.headers.get("x-wp-total") ?? 0),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

/** 複数カテゴリID で記事を取得（WP は categories=1,2,3 をOR検索で処理する） */
export async function getPostsByCategoryIds(
  ids: number[],
  opts: { page?: number; perPage?: number } = {}
): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 12 } = opts;
  const qs = new URLSearchParams({
    _embed: "1",
    per_page: String(perPage),
    page: String(page),
    categories: ids.join(","),
  });
  const res = await fetch(`${WP_BASE}/posts?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);
  const posts = (await res.json()) as WPPost[];
  return {
    posts,
    total: Number(res.headers.get("x-wp-total") ?? 0),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

/** 全文検索（?search= パラメータ使用） */
export async function searchPosts(
  q: string,
  page = 1
): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams({
    _embed: "1",
    per_page: "12",
    page: String(page),
    search: q,
  });
  const res = await fetch(`${WP_BASE}/posts?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);
  const posts = (await res.json()) as WPPost[];
  return {
    posts,
    total: Number(res.headers.get("x-wp-total") ?? 0),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  return posts[0] ?? null;
}

/** hideEmpty=true（既定）は記事0件のカテゴリを除外。ナビ生成では構造維持のため false で呼ぶ。 */
export async function getCategories(opts?: { hideEmpty?: boolean }): Promise<WPCategory[]> {
  const hideEmpty = opts?.hideEmpty ?? true;
  return wpFetch<WPCategory[]>(`/categories?per_page=100&hide_empty=${hideEmpty}`);
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>(`/categories?slug=${encodeURIComponent(slug)}`);
  return cats[0] ?? null;
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
