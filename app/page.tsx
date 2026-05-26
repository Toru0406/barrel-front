import Link from "next/link";
import Image from "next/image";
import {
  Users, HeartPulse, ClipboardList, Dumbbell, Trophy, FlaskConical,
} from "lucide-react";
import {
  getPosts, getCategories, getFeaturedImage, getPostCategories, formatDate,
  WPPost,
} from "@/lib/wordpress";
import FadeIn from "@/components/FadeIn";
import HeroSlideshow from "@/components/HeroSlideshow";

export const revalidate = 60;

const CATEGORIES = [
  { name: "指導・育成", slug: "coaching", icon: Users },
  { name: "コンディショニング", slug: "conditioning", icon: HeartPulse },
  { name: "チーム運営", slug: "management", icon: ClipboardList },
  { name: "トレーニング", slug: "training", icon: Dumbbell },
  { name: "競技別", slug: "sports", icon: Trophy },
  { name: "科学", slug: "science", icon: FlaskConical },
];

function LargePostCard({ post }: { post: WPPost }) {
  const image = getFeaturedImage(post);
  const cats = getPostCategories(post);
  return (
    <article className="group card-base overflow-hidden h-full">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video bg-barrel-gray-200 overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={450}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-barrel-green/10 to-barrel-beige/20" />
          )}
        </div>
        <div className="p-6">
          {cats.length > 0 && (
            <span className="badge">{cats[0].name}</span>
          )}
          <h2
            className="mt-4 font-serif text-card font-bold text-barrel-black line-clamp-2 leading-tight group-hover:text-barrel-green transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p
            className="mt-3 font-sans text-sm text-barrel-gray-600 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <time className="mt-4 block font-sans text-xs text-barrel-gray-400">
            {formatDate(post.date)}
          </time>
        </div>
      </Link>
    </article>
  );
}

function SmallPostCard({ post }: { post: WPPost }) {
  const image = getFeaturedImage(post);
  const cats = getPostCategories(post);
  return (
    <article className="group card-base overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="flex gap-4 p-4">
        {image && (
          <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              width={200}
              height={200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {cats.length > 0 && (
            <span className="badge">{cats[0].name}</span>
          )}
          <h3
            className="mt-2 font-serif text-sm font-bold text-barrel-black line-clamp-3 leading-snug group-hover:text-barrel-green transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <time className="mt-2 block font-sans text-xs text-barrel-gray-400">
            {formatDate(post.date)}
          </time>
        </div>
      </Link>
    </article>
  );
}

export default async function HomePage() {
  const [postsResult, categories] = await Promise.all([
    getPosts({ perPage: 3 }).catch(() => ({ posts: [], total: 0, totalPages: 0 })),
    getCategories().catch(() => []),
  ]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const mainPost  = postsResult.posts[0] ?? null;
  const sidePost1 = postsResult.posts[1] ?? null;
  const sidePost2 = postsResult.posts[2] ?? null;

  return (
    <div>
      {/* Hero */}
      <HeroSlideshow />

      {/* 最新記事 */}
      <section className="bg-barrel-white">
        <div className="section-base max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex items-baseline justify-between pb-4 border-b-2 border-barrel-green mb-12">
              <h2 className="font-serif text-section font-bold">最新記事</h2>
              <Link
                href="/blog"
                className="font-sans text-sm text-barrel-green border-b border-barrel-green hover:text-barrel-beige hover:border-barrel-beige transition-colors"
              >
                すべての記事を見る →
              </Link>
            </div>
          </FadeIn>

          {(mainPost || sidePost1 || sidePost2) ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mainPost && (
                <FadeIn className="lg:col-span-2 h-full">
                  <LargePostCard post={mainPost} />
                </FadeIn>
              )}
              <div className="flex flex-col gap-6">
                {sidePost1 && (
                  <FadeIn delay={0.1}>
                    <SmallPostCard post={sidePost1} />
                  </FadeIn>
                )}
                {sidePost2 && (
                  <FadeIn delay={0.2}>
                    <SmallPostCard post={sidePost2} />
                  </FadeIn>
                )}
              </div>
            </div>
          ) : (
            <p className="font-sans text-barrel-gray-600 text-center py-20">記事がありません</p>
          )}
        </div>
      </section>

      {/* カテゴリ */}
      <section className="bg-white">
        <div className="section-base max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="section-title">カテゴリから探す</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => {
              const wpCat = categoryMap[cat.slug];
              const Icon = cat.icon;
              return (
                <FadeIn key={cat.slug} delay={i * 0.06}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group card-base flex items-start gap-4 p-6 border-l-4 border-l-barrel-green hover:bg-barrel-green"
                  >
                    <Icon
                      size={24}
                      className="text-barrel-green group-hover:text-barrel-beige transition-colors flex-shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                    <div>
                      <span className="block font-serif font-bold text-barrel-black group-hover:text-white transition-colors">
                        {cat.name}
                      </span>
                      <span className="mt-1 block font-sans text-sm text-barrel-gray-400 group-hover:text-barrel-gray-200 transition-colors">
                        {wpCat ? `${wpCat.count} 記事` : "—"}
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* メルマガCTA */}
      <section className="bg-barrel-green">
        <FadeIn>
          <div className="section-base max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-section text-white font-bold">
              指導者も、選手も、保護者も。
            </h2>
            <p className="mt-4 font-sans text-barrel-beige/80 leading-relaxed">
              論文ベースのスポーツ科学記事を毎週配信。
            </p>
            <Link href="/contact" className="mt-8 inline-block btn-primary">
              購読登録する
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
