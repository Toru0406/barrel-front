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
    <div className="max-w-6xl mx-auto px-6 py-16 bg-[#0A0A0A] min-h-screen">
      <h1 className="font-serif text-2xl font-bold text-white mb-10">記事一覧</h1>
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
        <p className="text-[#999999] text-center py-20">記事がありません</p>
      )}
    </div>
  );
}
