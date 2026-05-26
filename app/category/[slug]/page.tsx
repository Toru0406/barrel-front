import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories, getPosts } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export const revalidate = 60;
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
  return { title: `${cat.name} の記事一覧` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug).catch(() => null);
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { posts, totalPages } = await getPosts({
    page,
    perPage: 12,
    categoryId: category.id,
  }).catch(() => ({ posts: [], total: 0, totalPages: 1 }));

  return (
    <div className="bg-barrel-white min-h-screen">
      <div className="section-base max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-sans text-xs text-barrel-gray-400 mb-2 tracking-widest uppercase">
            Category
          </p>
          <h1 className="font-serif text-section font-bold text-barrel-black pb-4 border-b-2 border-barrel-green">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 font-sans text-barrel-gray-600 text-sm leading-relaxed">
              {category.description}
            </p>
          )}
          <p className="mt-2 font-sans text-xs text-barrel-gray-400">
            {category.count}件の記事
          </p>
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
          <p className="font-sans text-barrel-gray-600 text-center py-20">
            このカテゴリの記事はありません
          </p>
        )}
      </div>
    </div>
  );
}
