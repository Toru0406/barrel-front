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

interface Props {
  params: { slug: string };
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 50 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
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
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* カテゴリ */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* タイトル */}
      <h1
        className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      <time className="mt-3 block text-sm text-gray-400">{formatDate(post.date)}</time>

      {/* アイキャッチ */}
      {image && (
        <div className="mt-8 rounded-xl overflow-hidden aspect-video bg-gray-100">
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
        className="mt-10 prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />

      {/* 戻るリンク */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← 記事一覧に戻る
        </Link>
      </div>
    </article>
  );
}
