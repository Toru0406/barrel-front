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
  const { posts, totalPages } = await getPosts({ page, perPage: 12 }).catch(() => ({
    posts: [],
    total: 0,
    totalPages: 1,
  }));

  return (
    <div className="bg-barrel-white min-h-screen">
      <div className="section-base max-w-7xl mx-auto">
        <h1 className="section-title">記事一覧</h1>
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
          <p className="font-sans text-barrel-gray-600 text-center py-20">記事がありません</p>
        )}
      </div>
    </div>
  );
}
