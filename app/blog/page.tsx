import type { Metadata } from "next";
import { getPosts } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = { title: "記事一覧" };
export const revalidate = 60;

interface Props {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { posts, totalPages } = await getPosts({ page, perPage: 12 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">記事一覧</h1>
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
        </>
      ) : (
        <p className="text-gray-500 text-center py-20">記事がありません</p>
      )}
    </div>
  );
}
