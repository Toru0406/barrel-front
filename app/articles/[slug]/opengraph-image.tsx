import { ImageResponse } from "next/og";
import { getPostBySlug, getPostCategories } from "@/lib/wordpress";

// nodejs ランタイムは Windows で @vercel/og の内蔵フォント解決が壊れる（ERR_INVALID_URL）ため edge を使う
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BARREL 記事";

interface Props {
  params: { slug: string };
}

/**
 * 日本語グリフを描くためのフォント取得。@vercel/og の内蔵フォントは Latin のみで、
 * 和文タイトルは豆腐になる。Google Fonts の text= サブセットで必要な字だけの TTF を取る。
 * 取得に失敗しても画像生成は続ける（英字のみ正しく描画される）。
 */
async function loadJapaneseFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`,
      // 古い UA を名乗ると woff2 ではなく satori が読める TTF の URL が返る
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:20.0) Gecko/20100101 Firefox/20.0" } }
    ).then((r) => r.text());
    // 返る形式は UA により woff / truetype が混在するため、最初の url() を素直に取る（satori は woff2 以外を読める）
    const url = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OGImage({ params }: Props) {
  let title = "BARREL — 研究に基づくスポーツ科学メディア";
  let category = "";

  try {
    const post = await getPostBySlug(params.slug);
    if (post) {
      title = post.title.rendered.replace(/<[^>]+>/g, "").slice(0, 70);
      category = getPostCategories(post)[0]?.name ?? "";
    }
  } catch {
    // フォールバック値を使用
  }

  const font = await loadJapaneseFont(`${title}${category}BARREL`);
  const fontSize = title.length > 40 ? 52 : title.length > 25 ? 60 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0D3320",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: font ? "NotoSansJP" : "sans-serif",
        }}
      >
        <div
          style={{
            color: "#E8D5B0",
            fontSize: 22,
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          {category || "BARREL"}
        </div>

        <div
          style={{
            color: "#F8F7F3",
            fontSize,
            fontWeight: 700,
            lineHeight: 1.3,
            maxWidth: 1000,
            display: "flex",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 64, height: 3, backgroundColor: "#E8D5B0" }} />
          <div
            style={{
              color: "#E8D5B0",
              fontSize: 22,
              letterSpacing: "0.18em",
              fontWeight: 700,
            }}
          >
            BARREL
          </div>
        </div>
      </div>
    ),
    // fonts: [] を渡すと内蔵フォントも無効化され「No fonts are loaded」で落ちる。取得失敗時はキー自体を省く
    font
      ? { ...size, fonts: [{ name: "NotoSansJP", data: font, weight: 700 as const, style: "normal" as const }] }
      : { ...size }
  );
}
