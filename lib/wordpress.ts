import https from "https";
import { IncomingMessage } from "http";

// Vercelビルド時のDNSループを回避するため、WordPressサーバーIPへ直接接続
const WP_IP = "150.95.255.38";
const WP_HOST = "www.getabarrel.com";
const WP_BASE_PATH = "/wp-json/wp/v2";

const agent = new https.Agent({ rejectUnauthorized: false });

interface RawResponse {
  status: number;
  headers: IncomingMessage["headers"];
  body: string;
}

function ipFetch(path: string): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: WP_IP,
        port: 443,
        path: `${WP_BASE_PATH}${path}`,
        method: "GET",
        agent,
        headers: { Host: WP_HOST, Accept: "application/json" },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => (body += chunk.toString()));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body })
        );
      }
    );
    req.on("error", reject);
    req.end();
  });
}

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
  const res = await ipFetch(path);
  if (res.status < 200 || res.status >= 300)
    throw new Error(`WordPress API error: ${res.status} ${path}`);
  return JSON.parse(res.body) as T;
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

  const res = await ipFetch(`/posts?${qs}`);
  if (res.status < 200 || res.status >= 300)
    throw new Error(`WordPress API error: ${res.status}`);

  const posts = JSON.parse(res.body) as WPPost[];
  return {
    posts,
    total: Number(res.headers["x-wp-total"] ?? 0),
    totalPages: Number(res.headers["x-wp-totalpages"] ?? 1),
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
