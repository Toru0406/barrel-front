import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getCategories,
  getPosts,
  WPPost,
} from "@/lib/wordpress";
import { hubForCategorySlug } from "@/lib/hubs";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleListItem from "@/components/ArticleListItem";
import SectionHeading from "@/components/SectionHeading";
import Eyebrow from "@/components/Eyebrow";
import Pagination from "@/components/Pagination";

export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.slug).catch(() => null);
  if (!cat) return {};
  return {
    title: `${cat.name} の記事一覧 | BARREL`,
    description: cat.description || `${cat.name}に関する記事一覧`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug).catch(() => null);
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  let posts: WPPost[] = [];
  let totalPages = 1;

  try {
    const result = await getPosts({
      page,
      perPage: 20,
      categoryId: category.id,
    });
    posts = result.posts;
    totalPages = result.totalPages;
  } catch {
    /* WP エラー → 空状態を表示 */
  }

  /* 親ハブを探す */
  const parentHub = hubForCategorySlug(params.slug);

  const breadcrumbs = [
    { label: "ホーム", href: "/" },
    ...(parentHub
      ? [{ label: parentHub.label, href: `/hub/${parentHub.id}` }]
      : []),
    { label: category.name },
  ];

  return (
    <div style={{ backgroundColor: "var(--c-paper)", minHeight: "100vh" }}>
      <div className="mx-auto px-4" style={{ maxWidth: 1240 }}>
        <Breadcrumbs items={breadcrumbs} />
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
          <Eyebrow className="mb-s-2">CATEGORY</Eyebrow>
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
            {category.name}
          </h1>

          {/* 説明文 */}
          {category.description && (
            <p
              className="mb-s-3"
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "var(--t-sm)",
                color: "var(--c-ink-muted)",
                lineHeight: 1.75,
                maxWidth: 640,
              }}
            >
              {category.description}
            </p>
          )}

          {/* 親ハブへのリンク */}
          {parentHub && (
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "var(--t-xs)",
                color: "var(--c-ink-muted)",
              }}
            >
              テーマ:{" "}
              <Link
                href={`/hub/${parentHub.id}`}
                style={{ color: "var(--c-green)", borderBottom: "1px solid var(--c-green)" }}
                className="transition-opacity hover:opacity-70"
              >
                {parentHub.label}
              </Link>
            </p>
          )}
        </div>
      </header>

      {/* 記事リスト */}
      <div className="mx-auto px-4 pb-s-8" style={{ maxWidth: 1240 }}>
        {posts.length === 0 ? (
          <p
            className="py-s-8 text-center"
            style={{ fontFamily: "var(--f-body)", color: "var(--c-ink-muted)" }}
          >
            このカテゴリの記事はありません
          </p>
        ) : (
          <>
            <SectionHeading
              title={`${category.name}の記事 (${category.count}件)`}
            />
            {posts.map((post) => (
              <ArticleListItem key={post.id} post={post} showThumbnail={false} />
            ))}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/category/${params.slug}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
