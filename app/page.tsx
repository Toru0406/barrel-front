import Link from "next/link";
import { getPosts, getCategories } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";

export const revalidate = 60;

const FEATURED_CATEGORIES = [
  { name: "指導論", slug: "coaching" },
  { name: "科学", slug: "science" },
  { name: "運営", slug: "management" },
  { name: "トレーニング", slug: "training" },
];

export default async function HomePage() {
  const [{ posts: latestPosts }, categories] = await Promise.all([
    getPosts({ perPage: 3 }),
    getCategories(),
  ]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://getabarrel.com/wp-content/uploads/hero-bg.jpg')" }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-6 py-36 md:py-48">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-6">
            Baseball × Science
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            科学が、指導を変える。
          </h1>
          <p className="mt-5 text-lg md:text-xl text-gray-300 font-light">
            高校野球の『なぜ』を論文で解く。
          </p>
          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-2 border border-white text-white px-7 py-3 text-sm tracking-wide hover:bg-white hover:text-gray-950 transition-colors duration-200"
          >
            最新記事を読む →
          </Link>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-xs tracking-[0.25em] uppercase text-gray-400">Latest</h2>
          <Link href="/blog" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">
            すべて見る →
          </Link>
        </div>
        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-16">記事がありません</p>
        )}
      </section>

      {/* Category Grid */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-10">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            {FEATURED_CATEGORIES.map((fc) => {
              const cat = categoryMap[fc.slug];
              return (
                <Link
                  key={fc.slug}
                  href={`/category/${fc.slug}`}
                  className="group bg-white p-10 flex flex-col justify-between hover:bg-gray-950 transition-colors duration-200"
                >
                  <span className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors">
                    {fc.name}
                  </span>
                  <span className="mt-6 text-xs text-gray-400 group-hover:text-gray-400 transition-colors">
                    {cat ? `${cat.count} 記事` : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
