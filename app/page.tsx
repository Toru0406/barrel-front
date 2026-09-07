import Link from "next/link";
import {
  getPosts,
  getPostBySlug,
  getPostsByCategoryIds,
  WPPost,
} from "@/lib/wordpress";
import { getPopularSlugs } from "@/lib/ga4";
import { HUBS } from "@/lib/hubs";
import LeadStory from "@/components/LeadStory";
import SecondaryStory from "@/components/SecondaryStory";
import ArticleListItem from "@/components/ArticleListItem";
import SectionHeading from "@/components/SectionHeading";
import LineCta from "@/components/LineCta";
import Eyebrow from "@/components/Eyebrow";

export const revalidate = 300;

export default async function HomePage() {
  /* ---------- データ取得 ---------- */
  const [latestResult, popularSlugs] = await Promise.all([
    getPosts({ perPage: 20 }).catch(() => ({ posts: [] as WPPost[], total: 0, totalPages: 0 })),
    getPopularSlugs(8).catch(() => [] as string[]),
  ]);
  const latestPosts = latestResult.posts;

  /* Hub ポスト & 人気記事を並行取得 */
  const [hubData, resolvedPopularRaw] = await Promise.all([
    Promise.all(
      HUBS.map(async (hub) => {
        const { posts } = await getPostsByCategoryIds(hub.wpCategoryIds, { perPage: 4 }).catch(
          () => ({ posts: [] as WPPost[] })
        );
        return { hub, posts };
      })
    ),
    popularSlugs.length > 0
      ? Promise.all(popularSlugs.map((slug) => getPostBySlug(slug).catch(() => null))).then(
          (rs) => rs.filter((p): p is WPPost => p !== null)
        )
      : Promise.resolve([] as WPPost[]),
  ]);

  const popularPosts: WPPost[] =
    resolvedPopularRaw.length > 0 ? resolvedPopularRaw : latestPosts.slice(3, 11);

  /* ページレイアウト用に分配 */
  const lead = latestPosts[0];
  const sub1 = latestPosts[1];
  const sub2 = latestPosts[2];
  const latestList = latestPosts.slice(3, 11);

  /* ---------- レンダリング ---------- */
  return (
    <div style={{ backgroundColor: "var(--c-paper)" }}>
      {/* =====================================================
          Section 1: リード（7/5 グリッド）
          ===================================================== */}
      <section
        style={{ borderBottom: "1px solid var(--c-line)" }}
        aria-label="注目記事"
      >
        <div
          className="mx-auto px-4 py-s-7"
          style={{ maxWidth: 1240 }}
        >
          <div className="grid grid-cols-12 gap-s-5 lg:gap-s-6">
            {/* Lead: 7 col */}
            <div className="col-span-12 lg:col-span-7">
              {lead ? (
                <LeadStory post={lead} />
              ) : (
                <p style={{ color: "var(--c-ink-muted)" }}>記事を取得できませんでした</p>
              )}
            </div>

            {/* Secondary: 5 col（デスクトップのみ表示） */}
            <div
              className="hidden lg:flex lg:col-span-5 flex-col gap-s-5"
              style={{ borderLeft: "1px solid var(--c-line)", paddingLeft: "var(--s-6)" }}
            >
              {sub1 && <SecondaryStory post={sub1} />}
              {sub2 && <SecondaryStory post={sub2} />}
            </div>

            {/* モバイル: Secondaryを縦並び表示 */}
            {sub1 && (
              <div className="col-span-12 lg:hidden" style={{ borderTop: "1px solid var(--c-line)", paddingTop: "var(--s-5)" }}>
                <SecondaryStory post={sub1} />
              </div>
            )}
            {sub2 && (
              <div className="col-span-12 lg:hidden">
                <SecondaryStory post={sub2} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          Section 2: 最新（8/4 グリッド）
          ===================================================== */}
      <section aria-label="最新記事">
        <div
          className="mx-auto px-4 py-s-7"
          style={{ maxWidth: 1240 }}
        >
          <div className="grid grid-cols-12 gap-s-6">
            {/* 最新リスト: 8 col */}
            <div className="col-span-12 lg:col-span-8">
              <SectionHeading
                title="最新"
                allHref="/blog"
                allLabel="すべて見る →"
              />
              {latestList.length > 0 ? (
                latestList.map((post) => (
                  <ArticleListItem key={post.id} post={post} showThumbnail />
                ))
              ) : (
                <p style={{ color: "var(--c-ink-muted)", fontFamily: "var(--f-body)" }}>
                  記事がありません
                </p>
              )}
            </div>

            {/* よく読まれている: 4 col */}
            <div
              className="col-span-12 lg:col-span-4"
              style={{
                borderLeft: "1px solid var(--c-line)",
                paddingLeft: "var(--s-5)",
              }}
            >
              <SectionHeading title="よく読まれている" />
              {popularPosts.length > 0 && (
                <ol aria-label="人気記事ランキング">
                  {popularPosts.slice(0, 8).map((post, i) => (
                    <li
                      key={post.id}
                      style={{ borderBottom: "1px solid var(--c-line)" }}
                    >
                      <Link
                        href={`/articles/${post.slug}`}
                        className="flex gap-s-3 items-start py-s-3 min-h-[44px] transition-opacity hover:opacity-75"
                      >
                        {/* 番号: Oswald 大文字 */}
                        <span
                          aria-hidden="true"
                          className="flex-shrink-0 w-7 text-right leading-none pt-0.5"
                          style={{
                            fontFamily: "var(--f-utility)",
                            fontSize: "var(--t-xl)",
                            fontWeight: 500,
                            color: "var(--c-ink-muted)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="line-clamp-3"
                          style={{
                            fontFamily: "var(--f-display)",
                            fontSize: "var(--t-sm)",
                            fontWeight: 700,
                            color: "var(--c-ink)",
                            lineHeight: 1.5,
                            letterSpacing: "0.02em",
                          }}
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Section 3: テーマ別（全幅緑帯）
          ===================================================== */}
      <section className="line-band" aria-label="テーマ別記事">
        <div className="mx-auto px-4 py-s-7" style={{ maxWidth: 1240 }}>
          <Eyebrow className="text-barrel-beige mb-s-2">TOPIC</Eyebrow>
          <h2
            className="mb-s-7"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-2xl)",
              fontWeight: 700,
              color: "var(--c-beige)",
              letterSpacing: "0.02em",
              fontFeatureSettings: '"palt" 1',
            }}
          >
            テーマから探す
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-s-5">
            {hubData.map(({ hub, posts }) => (
              <div
                key={hub.id}
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  paddingTop: "var(--s-4)",
                }}
              >
                {/* Hub ラベル */}
                <h3
                  className="mb-s-1"
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: "var(--t-lg)",
                    fontWeight: 700,
                    color: "var(--c-beige)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {hub.label}
                </h3>

                {/* Tagline */}
                <p
                  className="mb-s-4"
                  style={{
                    fontFamily: "var(--f-body)",
                    fontSize: "var(--t-xs)",
                    color: "rgba(232,213,176,0.7)",
                    lineHeight: 1.6,
                  }}
                >
                  {hub.tagline}
                </p>

                {/* 最新 3 記事 */}
                {posts.length > 0 && (
                  <ul className="mb-s-4">
                    {posts.slice(0, 3).map((post) => (
                      <li
                        key={post.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.12)",
                          paddingBlock: "var(--s-2)",
                        }}
                      >
                        <Link
                          href={`/articles/${post.slug}`}
                          className="block line-clamp-2 transition-opacity hover:opacity-80"
                          style={{
                            fontFamily: "var(--f-body)",
                            fontSize: "var(--t-xs)",
                            color: "rgba(232,213,176,0.9)",
                            lineHeight: 1.5,
                          }}
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {/* すべて見るリンク */}
                <Link
                  href={`/hub/${hub.id}`}
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontFamily: "var(--f-utility)",
                    fontSize: "var(--t-xs)",
                    color: "var(--c-beige)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  このテーマをすべて見る →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          Section 4: LINE CTA
          ===================================================== */}
      <LineCta />

      {/* =====================================================
          Section 5: BARRELの編集方針（E-E-A-T）
          ===================================================== */}
      <section
        style={{ borderTop: "1px solid var(--c-line)" }}
        aria-label="BARRELの編集方針"
      >
        <div className="mx-auto px-4 py-s-7" style={{ maxWidth: 1240 }}>
          <Eyebrow className="mb-s-4">ABOUT BARREL</Eyebrow>
          <h2
            className="mb-s-6"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-xl)",
              fontWeight: 700,
              color: "var(--c-ink)",
              letterSpacing: "0.02em",
            }}
          >
            BARRELの編集方針
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-s-6">
            {/* 列1 */}
            <div style={{ borderTop: "3px solid var(--c-green)", paddingTop: "var(--s-4)" }}>
              <h3
                className="mb-s-3"
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-base)",
                  fontWeight: 700,
                  color: "var(--c-ink)",
                }}
              >
                出典は一次・二次情報のみ
              </h3>
              <p
                className="mb-s-4"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-sm)",
                  color: "var(--c-ink-muted)",
                  lineHeight: 1.75,
                }}
              >
                掲載する情報は査読済み論文・公的機関の発表・一次文献に限定します。
                憶測や二次引用の孫引きは行いません。
              </p>
              <Link
                href="/about"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-xs)",
                  color: "var(--c-green)",
                  borderBottom: "1px solid var(--c-green)",
                }}
                className="transition-opacity hover:opacity-70"
              >
                詳しく読む
              </Link>
            </div>

            {/* 列2 */}
            <div style={{ borderTop: "3px solid var(--c-green)", paddingTop: "var(--s-4)" }}>
              <h3
                className="mb-s-3"
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-base)",
                  fontWeight: 700,
                  color: "var(--c-ink)",
                }}
              >
                PR表記の方針
              </h3>
              <p
                className="mb-s-4"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-sm)",
                  color: "var(--c-ink-muted)",
                  lineHeight: 1.75,
                }}
              >
                広告・提供記事・アフィリエイトリンクには、記事冒頭または
                リンク近傍に「PR」を必ず表記します。
              </p>
              <Link
                href="/about"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-xs)",
                  color: "var(--c-green)",
                  borderBottom: "1px solid var(--c-green)",
                }}
                className="transition-opacity hover:opacity-70"
              >
                詳しく読む
              </Link>
            </div>

            {/* 列3 */}
            <div style={{ borderTop: "3px solid var(--c-green)", paddingTop: "var(--s-4)" }}>
              <h3
                className="mb-s-3"
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-base)",
                  fontWeight: 700,
                  color: "var(--c-ink)",
                }}
              >
                誤りの訂正方針
              </h3>
              <p
                className="mb-s-4"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-sm)",
                  color: "var(--c-ink-muted)",
                  lineHeight: 1.75,
                }}
              >
                事実誤認が判明した場合は、訂正箇所と日時を記事末尾に明記し
                修正します。削除・無断改変は行いません。
              </p>
              <Link
                href="/about"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-xs)",
                  color: "var(--c-green)",
                  borderBottom: "1px solid var(--c-green)",
                }}
                className="transition-opacity hover:opacity-70"
              >
                詳しく読む
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
