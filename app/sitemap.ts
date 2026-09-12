import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/wordpress";
import { HUBS } from "@/lib/hubs";

const BASE = "https://www.getabarrel.com";

/**
 * WP REST API は date・modified を常に返す。
 * WPPost 型に modified が未定義のため、ローカル拡張型でキャスト。
 */
type WPPostPartial = { slug: string; date: string; modified?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 全記事をページネーションで収集 (perPage=100)
  const allPosts: WPPostPartial[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    try {
      const result = await getPosts({ page, perPage: 100 });
      allPosts.push(...(result.posts as WPPostPartial[]));
      totalPages = result.totalPages;
      page++;
    } catch {
      break;
    }
  } while (page <= totalPages);

  const postPages: MetadataRoute.Sitemap = allPosts.map((p) => ({
    url: `${BASE}/articles/${p.slug}`,
    lastModified: new Date(p.modified ?? p.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ハブは読者向けの入口であると同時に、記事へのクロール経路でもある。
  // sitemap に無いと Google が発見できない（2026-09-12 時点で全ハブが未認識だった）
  const hubPages: MetadataRoute.Sitemap = HUBS.map((h) => ({
    url: `${BASE}/hub/${h.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...hubPages, ...postPages];
}
