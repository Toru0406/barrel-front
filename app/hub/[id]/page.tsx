import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HUBS, hubById } from "@/lib/hubs";
import { getPostsByCategoryIds, WPPost } from "@/lib/wordpress";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleListItem from "@/components/ArticleListItem";
import LeadStory from "@/components/LeadStory";
import SectionHeading from "@/components/SectionHeading";
import Eyebrow from "@/components/Eyebrow";
import Pagination from "@/components/Pagination";

export const revalidate = 300;
export const dynamicParams = false;

interface Props {
  params: { id: string };
  searchParams: { page?: string };
}

export function generateStaticParams() {
  return HUBS.map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const hub = hubById(params.id);
  if (!hub) return {};
  return {
    title: hub.label, // layout の template が「| BARREL」を付ける
    description: hub.tagline,
  };
}

export default async function HubPage({ params, searchParams }: Props) {
  const hub = hubById(params.id);
  if (!hub) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));

  let posts: WPPost[] = [];
  let totalPages = 1;

  if (hub.wpCategoryIds.length > 0) {
    try {
      const result = await getPostsByCategoryIds(hub.wpCategoryIds, {
        page,
        perPage: 20,
      });
      posts = result.posts;
      totalPages = result.totalPages;
    } catch {
      /* WP エラー → 空状態を表示 */
    }
  }

  const leadPost = page === 1 ? posts[0] : undefined;
  const listPosts = page === 1 ? posts.slice(1) : posts;

  return (
    <div style={{ backgroundColor: "var(--c-paper)", minHeight: "100vh" }}>
      <div className="mx-auto px-4" style={{ maxWidth: 1240 }}>
        {/* パンくず */}
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: hub.label },
          ]}
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
          <Eyebrow className="mb-s-2">TOPIC</Eyebrow>
          <h1
            className="mb-s-3"
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
            {hub.label}
          </h1>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-base)",
              color: "var(--c-ink-muted)",
              lineHeight: 1.75,
              maxWidth: 640,
            }}
          >
            {hub.tagline}
          </p>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="mx-auto px-4 pb-s-8" style={{ maxWidth: 1240 }}>
        {posts.length === 0 ? (
          <p
            className="py-s-8 text-center"
            style={{
              fontFamily: "var(--f-body)",
              color: "var(--c-ink-muted)",
            }}
          >
            このテーマの記事はまだありません
          </p>
        ) : (
          <>
            {/* ページ1: リード記事 */}
            {leadPost && (
              <div className="mb-s-8">
                <LeadStory post={leadPost} />
              </div>
            )}

            {/* 記事リスト */}
            {listPosts.length > 0 && (
              <div className="mb-s-6">
                <SectionHeading title={page === 1 ? "記事一覧" : hub.label} />
                {listPosts.map((post) => (
                  <ArticleListItem key={post.id} post={post} showThumbnail={false} />
                ))}
              </div>
            )}

            {/* ページネーション */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/hub/${hub.id}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
