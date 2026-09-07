import type { Metadata } from "next";
import Link from "next/link";
import { searchPosts, WPPost } from "@/lib/wordpress";
import { HUBS } from "@/lib/hubs";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleListItem from "@/components/ArticleListItem";
import SectionHeading from "@/components/SectionHeading";
import Eyebrow from "@/components/Eyebrow";
import Pagination from "@/components/Pagination";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const q = (searchParams.q ?? "").trim();
  return {
    title: q ? `「${q}」の検索結果` : "記事を検索",
  };
}

interface Props {
  searchParams: { q?: string; page?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number(searchParams.page ?? 1));

  let posts: WPPost[] = [];
  let totalPages = 1;
  let total = 0;
  let fetchError = false;

  if (q) {
    try {
      const result = await searchPosts(q, page);
      posts = result.posts;
      totalPages = result.totalPages;
      total = result.total;
    } catch {
      fetchError = true;
    }
  }

  return (
    <div style={{ backgroundColor: "var(--c-paper)", minHeight: "100vh" }}>
      <div className="mx-auto px-4" style={{ maxWidth: 1240 }}>
        <Breadcrumbs
          items={[{ label: "ホーム", href: "/" }, { label: "検索" }]}
        />
      </div>

      {/* ヘッダー */}
      <header
        style={{
          borderBottom: "1px solid var(--c-line)",
          paddingBottom: "var(--s-6)",
          marginBottom: "var(--s-7)",
        }}
      >
        <div className="mx-auto px-4" style={{ maxWidth: 1240 }}>
          <Eyebrow className="mb-s-2">SEARCH</Eyebrow>
          <h1
            className="mb-s-5"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-2xl)",
              fontWeight: 700,
              color: "var(--c-ink)",
              letterSpacing: "0.02em",
            }}
          >
            記事を検索
          </h1>

          {/* 検索フォーム（GET メソッド、JS 不要） */}
          <form method="GET" action="/search" className="flex gap-s-3 items-end flex-wrap">
            <div className="flex-1" style={{ minWidth: 240, maxWidth: 480 }}>
              <label
                htmlFor="search-input"
                style={{
                  display: "block",
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-xs)",
                  color: "var(--c-ink-muted)",
                  marginBottom: "var(--s-1)",
                }}
              >
                キーワード
              </label>
              <input
                id="search-input"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="例: トレーニング、栄養、怪我予防"
                autoComplete="off"
                className="w-full focus:outline-none"
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-base)",
                  color: "var(--c-ink)",
                  backgroundColor: "var(--c-paper)",
                  border: "1px solid var(--c-line)",
                  borderRadius: "var(--r-1)",
                  padding: "var(--s-2) var(--s-3)",
                }}
              />
            </div>
            <button type="submit" className="btn-cta" style={{ flexShrink: 0 }}>
              検索
            </button>
          </form>
        </div>
      </header>

      {/* 結果エリア */}
      <div className="mx-auto px-4 pb-s-8" style={{ maxWidth: 1240 }}>
        {/* エラー */}
        {fetchError && (
          <p
            className="py-s-6"
            style={{ fontFamily: "var(--f-body)", color: "var(--c-ink-muted)" }}
          >
            検索中にエラーが発生しました。しばらくしてから再度お試しください。
          </p>
        )}

        {/* クエリなし: ハブ一覧を提案 */}
        {!q && !fetchError && (
          <div>
            <SectionHeading title="テーマから探す" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-s-4">
              {HUBS.map((hub) => (
                <Link
                  key={hub.id}
                  href={`/hub/${hub.id}`}
                  className="block transition-opacity hover:opacity-75"
                  style={{
                    borderTop: "3px solid var(--c-green)",
                    paddingTop: "var(--s-3)",
                  }}
                >
                  <h2
                    className="mb-s-1"
                    style={{
                      fontFamily: "var(--f-display)",
                      fontSize: "var(--t-base)",
                      fontWeight: 700,
                      color: "var(--c-ink)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {hub.label}
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: "var(--t-xs)",
                      color: "var(--c-ink-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {hub.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ゼロ件 */}
        {q && !fetchError && posts.length === 0 && (
          <div className="py-s-7 text-center">
            <p
              className="mb-s-4"
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "var(--t-base)",
                color: "var(--c-ink-muted)",
              }}
            >
              「{q}」に一致する記事は見つかりませんでした
            </p>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "var(--t-sm)",
                color: "var(--c-ink-muted)",
              }}
            >
              別のキーワードを試すか、
              <Link
                href="/blog"
                style={{
                  color: "var(--c-green)",
                  borderBottom: "1px solid var(--c-green)",
                }}
              >
                記事一覧
              </Link>
              をご覧ください。
            </p>
          </div>
        )}

        {/* 結果あり */}
        {q && !fetchError && posts.length > 0 && (
          <>
            <SectionHeading
              title={`「${q}」の検索結果 (${total}件)`}
            />
            {posts.map((post) => (
              <ArticleListItem key={post.id} post={post} showThumbnail={false} />
            ))}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/search"
              queryParams={{ q }}
            />
          </>
        )}
      </div>
    </div>
  );
}
