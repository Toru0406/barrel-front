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
    <article className="group bg-white rounded-[4px] overflow-hidden border border-[#E5E5E5] h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video bg-[#E5E5E5] overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={450}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0D3320]/10 to-[#E8D5B0]/20" />
          )}
        </div>
        <div className="p-6">
          {cats.length > 0 && (
            <span className="text-xs text-white bg-[#0D3320] px-3 py-1.5 font-medium">
              {cats[0].name}
            </span>
          )}
          <h2
            className="mt-4 font-serif text-2xl font-bold text-[#1A1A1A] line-clamp-2 leading-tight group-hover:text-[#0D3320] transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p
            className="mt-3 text-sm text-[#666666] line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <time className="mt-4 block text-xs text-[#999999]">{formatDate(post.date)}</time>
        </div>
      </Link>
    </article>
  );
}

function SmallPostCard({ post }: { post: WPPost }) {
  const image = getFeaturedImage(post);
  const cats = getPostCategories(post);
  return (
    <article className="group bg-white rounded-[4px] overflow-hidden border border-[#E5E5E5] hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <Link href={`/blog/${post.slug}`} className="flex gap-4 p-4">
        {image && (
          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-[4px]">
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
            <span className="text-xs text-white bg-[#0D3320] px-2 py-1 font-medium">
              {cats[0].name}
            </span>
          )}
          <h3
            className="mt-2 font-serif text-sm font-bold text-[#1A1A1A] line-clamp-3 leading-snug group-hover:text-[#0D3320] transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <time className="mt-2 block text-xs text-[#999999]">{formatDate(post.date)}</time>
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
  const mainPost = postsResult.posts[0] ?? null;
  const sidePost1 = postsResult.posts[1] ?? null;
  const sidePost2 = postsResult.posts[2] ?? null;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen overflow-hidden flex items-end">
        {/* Fallback gradient */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: "linear-gradient(135deg, #0D3320 0%, #1a4a2e 50%, #0a1f14 100%)" }}
        />
        {/* Background image */}
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          className="object-cover object-center z-[1]"
          priority
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(13,51,32,0.7) 60%, rgba(13,51,32,0.95) 100%)",
          }}
        />
        {/* Content */}
        <div className="relative z-[3] w-full max-w-4xl mx-auto px-6 pb-20 text-center">
          <p
            className="font-display italic text-[#E8D5B0] mb-4"
            style={{ fontSize: "14px", letterSpacing: "0.2em" }}
          >
            Sport × Science
          </p>
          <h1
            className="font-serif text-white font-bold mb-6"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
          >
            スポーツの『なぜ』を、科学で解く。
          </h1>
          <p className="font-sans text-[#CCCCCC] text-lg mb-8">
            すべての競技者へ。<br />
            論文が明かす、競技力向上の最前線。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/blog"
              className="bg-[#E8D5B0] text-[#0D3320] font-bold hover:bg-white transition-colors duration-200"
              style={{ padding: "16px 32px" }}
            >
              最新記事を読む
            </Link>
            <Link
              href="/about"
              className="text-white hover:bg-white/10 transition-colors duration-200"
              style={{ padding: "16px 32px", border: "1px solid rgba(255,255,255,0.6)" }}
            >
              BARRELとは
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="bg-[#FAFAF8] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">最新記事</h2>
              <Link
                href="/blog"
                className="text-sm text-[#0D3320] underline underline-offset-4 hover:opacity-70 transition-opacity"
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
            <p className="text-[#666666] text-center py-20">記事がありません</p>
          )}
        </div>
      </section>

      {/* Category Grid */}
      <section className="bg-white py-20 border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-10">
              カテゴリから探す
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => {
              const wpCat = categoryMap[cat.slug];
              const Icon = cat.icon;
              return (
                <FadeIn key={cat.slug} delay={i * 0.06}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group flex items-start gap-4 p-6 bg-white rounded-[4px] border border-[#E5E5E5] hover:bg-[#0D3320] transition-colors duration-200"
                    style={{ borderLeft: "4px solid #0D3320" }}
                  >
                    <Icon
                      size={24}
                      className="text-[#0D3320] group-hover:text-[#E8D5B0] transition-colors flex-shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                    <div>
                      <span className="block font-serif text-base font-bold text-[#1A1A1A] group-hover:text-white transition-colors">
                        {cat.name}
                      </span>
                      <span className="mt-1 block text-xs text-[#666666] group-hover:text-[#CCCCCC] transition-colors">
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

      {/* Newsletter CTA */}
      <section className="bg-[#FAFAF8] py-20" style={{ borderTop: "4px solid #0D3320" }}>
        <FadeIn>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1A1A1A] leading-snug">
              指導者も、選手も、保護者も。
            </h2>
            <p className="mt-4 text-[#666666] leading-relaxed">
              論文ベースのスポーツ科学記事を毎週配信。
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 bg-[#0D3320] text-white px-10 py-4 font-bold tracking-widest hover:opacity-90 transition-opacity duration-200"
            >
              購読登録する
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
