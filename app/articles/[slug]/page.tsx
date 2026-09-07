import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  getPostBySlug,
  getPosts,
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
  try {
    const { posts } = await getPosts({ perPage: 50 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
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

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          {/* ── 記事本文カラム (lg: 8/12) ── */}
          <div className="lg:col-span-8">
            {/* モバイル目次 — lg で非表示 */}
            <div className="lg:hidden mb-6">
              <ArticleToc headings={processed.headings} />
            </div>

            {firstCat && <Eyebrow>{firstCat.name}</Eyebrow>}

            <h1
              className="font-serif text-hero text-balance mt-2 mb-4 font-bold"
              style={{ lineHeight: 1.2, color: "var(--c-ink, #14201A)" }}
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* dek */}
            {description && (
              <p
                className="font-sans text-lg mb-6 leading-relaxed"
                style={{ color: "var(--c-ink-muted, #5F6B64)" }}
              >
                {description}
              </p>
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
              <div className="aspect-video w-full overflow-hidden mb-8">
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

            {/* シェアバー */}
            <ShareBar url={canonical} title={plainTitle} />

            {/* LINE CTA */}
            <LineCta />

            {/* 関連記事 */}
            <RelatedArticles posts={relatedPosts} />
          </div>

          {/* ── デスクトップ TOC サイドバー (lg: 4/12, sticky) ── */}
          <aside
            className="hidden lg:block lg:col-span-4"
            aria-label="目次"
          >
            <div className="sticky top-24 pt-2">
              <ArticleToc headings={processed.headings} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
