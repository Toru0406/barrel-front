import { getPosts, getFeaturedImage } from "@/lib/wordpress";

export const revalidate = 3600;

const BASE = "https://www.getabarrel.com";
const SITE_TITLE = "BARREL";
const SITE_DESC = "すべての競技人のための、スポーツ科学メディア";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    const result = await getPosts({ perPage: 30 });
    posts = result.posts;
  } catch {
    // WP が取得できない場合は空フィードを返す
  }

  const items = posts
    .map((post) => {
      const title = escapeXml(post.title.rendered.replace(/<[^>]+>/g, ""));
      const link = `${BASE}/articles/${post.slug}`;
      const description = escapeXml(
        post.excerpt.rendered
          .replace(/<[^>]+>/g, "")
          .replace(/\[.*?\]/g, "")
          .trim()
      );
      const image = getFeaturedImage(post);
      const pubDate = new Date(post.date).toUTCString();
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>${
        image
          ? `\n      <enclosure url="${escapeXml(image.src)}" type="image/jpeg" length="0"/>`
          : ""
      }
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>ja</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `s-maxage=${revalidate}, stale-while-revalidate`,
    },
  });
}
