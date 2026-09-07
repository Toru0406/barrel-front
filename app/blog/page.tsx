import type { Metadata } from "next";
import { getPosts, WPPost } from "@/lib/wordpress";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleListItem from "@/components/ArticleListItem";
import SectionHeading from "@/components/SectionHeading";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "研究に基づくスポーツ科学の記事一覧",
};
export const revalidate = 300;

interface Props {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1));

  let posts: WPPost[] = [];
  let totalPages = 1;
  let total = 0;

  try {
    const result = await getPosts({ page, perPage: 20 });
    posts = result.posts;
    totalPages = result.totalPages;
    total = result.total;
  } catch {
    /* WP エラー → 空状態を表示 */
  }

  return (
    <div style={{ backgroundColor: "var(--c-paper)", minHeight: "100vh" }}>
      <div className="mx-auto px-4" style={{ maxWidth: 1240 }}>
        <Breadcrumbs
          items={[{ label: "ホーム", href: "/" }, { label: "記事一覧" }]}
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
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-hero)",
              fontWeight: 700,
              letterSpacing: "0.02em",
              fontFeatureSettings: '"palt" 1',
              color: "var(--c-ink)",
              lineHeight: 1.2,
            }}
          >
            記事一覧
          </h1>
        </div>
      </header>

      {/* 記事リスト */}
      <div className="mx-auto px-4 pb-s-8" style={{ maxWidth: 1240 }}>
        {posts.length === 0 ? (
          <p
            className="py-s-8 text-center"
            style={{ fontFamily: "var(--f-body)", color: "var(--c-ink-muted)" }}
          >
            記事がありません
          </p>
        ) : (
          <>
            <SectionHeading
              title={`全 ${total} 件`}
            />
            {posts.map((post) => (
              <ArticleListItem key={post.id} post={post} showThumbnail={false} />
            ))}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/blog"
            />
          </>
        )}
      </div>
    </div>
  );
}
