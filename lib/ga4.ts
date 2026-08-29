import { JWT } from "google-auth-library";
import { unstable_cache } from "next/cache";

// GA4 Data API から人気記事（/articles/<slug>）のPV順スラッグを取得する。
// 失敗時は空配列を返し、呼び出し側で最新記事にフォールバックする。

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

async function accessToken(): Promise<string> {
  const jwt = new JWT({
    email: SA_EMAIL,
    key: SA_KEY,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const { access_token } = await jwt.authorize();
  if (!access_token) throw new Error("GA4: access_token 取得失敗");
  return access_token;
}

// pagePath からスラッグを取り出す。/articles/<slug> と 旧permalink /<slug>/ の両方に対応。
// articlesSet（/articles/ で観測されたslug集合）に含まれるものだけ旧permalinkを合算対象にする。
function slugFromArticlePath(path: string): string | null {
  const m = path.match(/^\/articles\/([^/?#]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}
function slugFromLegacyPath(path: string): string | null {
  const m = path.match(/^\/([^/?#]+)\/$/);
  if (!m) return null;
  const seg = decodeURIComponent(m[1]);
  // フロントの固定ページ/セクションは除外
  if (["about", "contact", "blog", "articles", "category", "page"].includes(seg)) return null;
  return seg;
}

async function fetchPopularSlugsUncached(limit: number): Promise<string[]> {
  if (!PROPERTY_ID || !SA_EMAIL || !SA_KEY) return [];
  const token = await accessToken();
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "200",
      }),
      // GA4は集計値なのでNextのfetchキャッシュも有効化（重複防止）
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`GA4 runReport HTTP ${res.status}`);
  const data = (await res.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
  };
  const rows = data.rows ?? [];

  // まず /articles/<slug> のPVを集計（正）
  const score = new Map<string, number>();
  for (const r of rows) {
    const slug = slugFromArticlePath(r.dimensionValues[0]?.value ?? "");
    if (!slug) continue;
    score.set(slug, (score.get(slug) ?? 0) + Number(r.metricValues[0]?.value ?? 0));
  }
  const known = new Set(Array.from(score.keys()));
  // 旧permalink /<slug>/ を、記事として確認済みのslugにだけ合算
  for (const r of rows) {
    const slug = slugFromLegacyPath(r.dimensionValues[0]?.value ?? "");
    if (!slug || !known.has(slug)) continue;
    score.set(slug, (score.get(slug) ?? 0) + Number(r.metricValues[0]?.value ?? 0));
  }

  return Array.from(score.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);
}

// 1時間キャッシュ。cron（/api/cron/popular）から revalidateTag("popular-hero") で更新。
export const getPopularSlugs = unstable_cache(
  async (limit = 8): Promise<string[]> => {
    try {
      return await fetchPopularSlugsUncached(limit);
    } catch {
      return [];
    }
  },
  ["popular-slugs"],
  { revalidate: 3600, tags: ["popular-hero"] }
);
