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

export default async function ArticlePage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);

  return (
    <div className="bg-barrel-white min-h-screen">
      <article className="max-w-3xl mx-auto px-6 py-16">
        {categories.length > 0 && (
          <div className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="badge hover:opacity-80 transition-opacity">
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <h1
          className="font-serif text-3xl md:text-4xl font-bold text-barrel-black leading-tight"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <time className="mt-4 block font-sans text-sm text-barrel-gray-400">
          {formatDate(post.date)}
        </time>

        {image && (
          <div className="mt-8 overflow-hidden aspect-video bg-barrel-gray-200">
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

        <div
          className="mt-10 prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-barrel-black prose-a:text-barrel-green prose-p:leading-relaxed prose-p:text-barrel-black"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        <div className="mt-16 pt-8 border-t border-barrel-gray-200">
          <Link
            href="/"
            className="font-sans text-sm text-barrel-green border-b border-barrel-green hover:text-barrel-beige hover:border-barrel-beige transition-colors"
          >
            ← トップに戻る
          </Link>
        </div>
      </article>
    </div>
  );
}
