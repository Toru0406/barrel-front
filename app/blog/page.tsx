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
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">記事一覧</h1>
          <div className="mt-2 w-12 h-1 bg-[#0D3320]" />
        </div>
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
          <p className="text-[#666666] text-center py-20">記事がありません</p>
        )}
      </div>
    </div>
  );
}
