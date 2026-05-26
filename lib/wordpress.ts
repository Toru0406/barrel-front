const WP_API =
  process.env.WORDPRESS_API_URL ?? "https://www.getabarrel.com/wp-json/wp/v2";

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
  description: string;
}

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_API}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status} ${path}`);
  return res.json();
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

  const res = await fetch(`${WP_API}/posts?${qs}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);

  const posts: WPPost[] = await res.json();
  return {
    posts,
    total: Number(res.headers.get("X-WP-Total") ?? 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 1),
  };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>(`/posts?slug=${slug}&_embed=1`);
  return posts[0] ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>("/categories?per_page=100&hide_empty=true");
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>(`/categories?slug=${slug}`);
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
