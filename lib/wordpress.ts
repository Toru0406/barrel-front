const WP_BASE = process.env.WORDPRESS_API_URL || "https://cms.getabarrel.com/wp-json/wp/v2";

export interface WPPost {
  id: number;
  date: string;
  slug: string;
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

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  return posts[0] ?? null;
}

// hideEmpty=true（既定）は記事0件のカテゴリを除外。ナビ生成では構造維持のため false で呼ぶ。
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

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// CMS(barrel-theme)と同じ「YYYY.MM.DD」表記
export function formatDateDot(dateStr: string): string {
  const d = new Date(dateStr);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

// 本文文字数からおおよその読了時間（分）を算出。CMSの「X分で読める」表記に合わせる。
export function readingTimeMin(post: WPPost): number {
  const text = post.content?.rendered?.replace(/<[^>]+>/g, "") ?? "";
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}
