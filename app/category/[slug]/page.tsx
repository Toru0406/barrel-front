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
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs text-[#999999] mb-2 tracking-widest uppercase">Category</p>
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">{category.name}</h1>
          <div className="mt-2 w-12 h-1 bg-[#0D3320]" />
          {category.description && (
            <p className="mt-4 text-[#666666] text-sm leading-relaxed">{category.description}</p>
          )}
          <p className="mt-2 text-xs text-[#999999]">{category.count}件の記事</p>
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
          <p className="text-[#666666] text-center py-20">このカテゴリの記事はありません</p>
        )}
      </div>
    </div>
  );
}
