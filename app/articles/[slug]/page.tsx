import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  getPostBySlug,
  getFeaturedImage,
  getPostCategories,
  formatDateDot,
  readingTimeMin,
} from "@/lib/wordpress";
import { processContent, extractKeyPoints } from "@/lib/article";
import KeyPoints from "@/components/KeyPoints";
import ArticleToc from "@/components/ArticleToc";
import ShareBar from "@/components/ShareBar";
import RelatedArticles from "@/components/RelatedArticles";

import {
  getPostsByCategoryIds,
  evidenceCount,
  excerptText,
} from "@/lib/wordpress";
import { hubForCategorySlug } from "@/lib/hubs";
import Eyebrow from "@/components/Eyebrow";
import EvidenceBadge from "@/components/EvidenceBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import LineCta from "@/components/LineCta";
import AffiliateClickTracker from "@/components/AffiliateClickTracker";

// ============================================================
// Route config
// ============================================================

export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

const BASE_URL = "https://www.getabarrel.com";

// ============================================================
// Static params
// ============================================================

export async function generateStaticParams() {
  // ビルド時にプリレンダーすると、デプロイ直後にほぼ全記事が not-found のページとして配信された（2026-09-11 実測 44本中42本）。
  // dynamicParams=true と revalidate=300 により初回アクセス時に生成・キャッシュされるため、ビルド時は生成しない
  return [];
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = (await getPostBySlug(params.slug).catch(
    () => null
  ));
  if (!post) return {};

  const title = post.title.rendered.replace(/<[^>]+>/g, "");
  const description = excerptText(post);
  const canonical = `${BASE_URL}/articles/${params.slug}`;
  const image = getFeaturedImage(post);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: image
        ? [{ url: image.src, width: 1200, height: 675, alt: image.alt }]
        : [{ url: `${BASE_URL}/articles/${params.slug}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

// ============================================================
// Page component
// ============================================================

export default async function ArticlePage({ params }: Props) {
  const post = (await getPostBySlug(params.slug));
  if (!post) notFound();

  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const plainTitle = post.title.rendered.replace(/<[^>]+>/g, "");
  const description = excerptText(post);
  const evCount = evidenceCount(post);
  const readMin = readingTimeMin(post);

  // Modified date — only show if differs from publish date by ≥1 day
  const modifiedStr = post.modified;
  const showModified =
    modifiedStr != null &&
    Math.abs(
      new Date(modifiedStr).getTime() - new Date(post.date).getTime()
    ) >= 86_400_000;

  // Content processing
  const processed = processContent(post.content.rendered);
  const keyPoints = extractKeyPoints(post.content.rendered, processed.headings);

  // Related posts from the same category
  const relatedPosts = await getPostsByCategoryIds(post.categories, { perPage: 4 })
    .then((r) => r.posts.filter((p) => p.id !== post.id).slice(0, 3))
    .catch(() => []);

  // Breadcrumb items
  const firstCat = categories[0];
  const hub = firstCat ? hubForCategorySlug(firstCat.slug) : null;
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "ホーム", href: "/" },
    ...(hub
      ? [{ label: hub.label, href: `/hub/${hub.id}` }]
      : firstCat
        ? [{ label: firstCat.name, href: `/category/${firstCat.slug}` }]
        : []),
    { label: plainTitle.length > 40 ? `${plainTitle.slice(0, 40)}…` : plainTitle },
  ];

  const canonical = `${BASE_URL}/articles/${params.slug}`;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: plainTitle,
        datePublished: post.date,
        dateModified: post.modified ?? post.date,
        image: image ? [image.src] : [],
        author: {
          "@type": "Organization",
          name: "BARREL編集部",
          url: `${BASE_URL}/about`,
        },
        publisher: {
          "@type": "Organization",
          name: "BARREL編集部",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo/barrel-logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonical,
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10"
        style={{ color: "var(--c-ink, #14201A)" }}
      >
        <Breadcrumbs items={breadcrumbItems} />

        {/* 見出し・リード画像・本文・表を同じ幅に揃えるため、目次は列を取らない */}
        <article>
          <div>
            {/* モバイル目次 — lg で非表示 */}
            <div className="lg:hidden mb-6">
              <ArticleToc headings={processed.headings} variant="inline" />
            </div>

            {firstCat && <Eyebrow>{firstCat.name}</Eyebrow>}

            <h1
              className="title-hero mt-2 mb-4"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* dek */}
            {description && (
              <p className="dek mb-6">{description}</p>
            )}

            {/* メタ行 */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs mb-8"
              style={{ color: "var(--c-ink-muted, #5F6B64)" }}
            >
              <time dateTime={post.date}>
                公開 {formatDateDot(post.date)}
              </time>
              {showModified && modifiedStr && (
                <time dateTime={modifiedStr}>
                  更新 {formatDateDot(modifiedStr)}
                </time>
              )}
              <span>{readMin}分で読める</span>
              <EvidenceBadge count={evCount} />
              <Link
                href="/about"
                className="hover:underline transition-colors"
                style={{ color: "var(--c-ink-muted, #5F6B64)" }}
              >
                BARREL編集部
              </Link>
            </div>

            {/* リード画像 */}
            {image && (
              <div className="lead-image aspect-video overflow-hidden mb-8">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
            )}

            {/* KeyPoints ボックス */}
            <KeyPoints data={keyPoints} />

            {/* 記事本文 */}
            <div
              className="prose-barrel mt-8"
              dangerouslySetInnerHTML={{ __html: processed.html }}
            />
            <AffiliateClickTracker />

            {/* シェアバー */}
            <ShareBar url={canonical} title={plainTitle} />

            {/* LINE CTA */}
            <LineCta />

            {/* 関連記事 */}
            <RelatedArticles posts={relatedPosts} />
          </div>

          {/* ── デスクトップ目次: 画面右下に固定し、ホバー・クリックで開く ── */}
          <div className="hidden lg:block">
            <ArticleToc headings={processed.headings} variant="floating" />
          </div>
        </article>
      </div>
    </>
  );
}
