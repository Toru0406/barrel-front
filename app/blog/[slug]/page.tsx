import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getPostBySlug,
  getPosts,
  getFeaturedImage,
  getPostCategories,
  formatDate,
} from "@/lib/wordpress";

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 50 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.title.rendered.replace(/<[^>]+>/g, ""),
    description: post.excerpt.rendered.replace(/<[^>]+>/g, "").trim().slice(0, 160),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* カテゴリ */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-xs text-white bg-[#0D3320] px-3 py-1.5 font-medium hover:opacity-80 transition-opacity"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* タイトル */}
        <h1
          className="font-serif text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <time className="mt-4 block text-sm text-[#999999]">{formatDate(post.date)}</time>

        {/* アイキャッチ */}
        {image && (
          <div className="mt-8 overflow-hidden rounded-[4px] aspect-video bg-[#E5E5E5]">
            <Image
              src={image.src}
              alt={image.alt}
              width={1200}
              height={675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* 本文 */}
        <div
          className="mt-10 prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#1A1A1A] prose-a:text-[#0D3320] prose-img:rounded-[4px] prose-p:leading-relaxed prose-p:text-[#1A1A1A]"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* 戻るリンク */}
        <div className="mt-16 pt-8 border-t border-[#E5E5E5]">
          <Link
            href="/blog"
            className="text-sm text-[#0D3320] hover:underline underline-offset-4 transition-all"
          >
            ← 記事一覧に戻る
          </Link>
        </div>
      </article>
    </div>
  );
}
