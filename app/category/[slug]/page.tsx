import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories, getPosts } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export const revalidate = 60;

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return {};
  return { title: `${cat.name} の記事一覧` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { posts, totalPages } = await getPosts({ page, perPage: 12, categoryId: category.id });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">カテゴリ</p>
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-500 text-sm">{category.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{category.count}件の記事</p>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/category/${params.slug}`}
          />
        </>
      ) : (
        <p className="text-gray-500 text-center py-20">この カテゴリの記事はありません</p>
      )}
    </div>
  );
}
