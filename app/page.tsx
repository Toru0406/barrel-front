import Link from "next/link";
import {
  Users,
  HeartPulse,
  ClipboardList,
  Dumbbell,
  Trophy,
  FlaskConical,
} from "lucide-react";
import { getPosts, getCategories } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";
import FadeIn from "@/components/FadeIn";
import ScrollIndicator from "@/components/ScrollIndicator";

export const revalidate = 60;

const CATEGORIES = [
  { name: "指導・育成", slug: "coaching", icon: Users },
  { name: "コンディショニング", slug: "conditioning", icon: HeartPulse },
  { name: "チーム運営", slug: "management", icon: ClipboardList },
  { name: "トレーニング", slug: "training", icon: Dumbbell },
  { name: "競技別", slug: "sports", icon: Trophy },
  { name: "科学", slug: "science", icon: FlaskConical },
];

const TARGET_CARDS = [
  { label: "指導者の方へ", href: "/category/coaching" },
  { label: "選手の方へ", href: "/category/training" },
  { label: "保護者の方へ", href: "/category/conditioning" },
  { label: "他競技の方へ", href: "/category/science" },
];

const BADGES = [
  { emoji: "👨‍🏫", label: "指導者" },
  { emoji: "⚾", label: "選手" },
  { emoji: "👨‍👩‍👦", label: "保護者" },
  { emoji: "🏫", label: "学校関係者" },
  { emoji: "🏃", label: "他競技コーチ" },
];

export default async function HomePage() {
  const [postsResult, categories] = await Promise.all([
    getPosts({ perPage: 3 }).catch(() => ({ posts: [], total: 0, totalPages: 0 })),
    getCategories().catch(() => []),
  ]);
  const latestPosts = postsResult.posts;

  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));

  return (
    <div className="bg-[#0A0A0A]">
      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(150deg, #0D3320 0%, #0A0A0A 55%)" }}
      >
        <div className="relative max-w-5xl mx-auto px-6 py-32 w-full">
          <FadeIn>
            <p className="text-xs tracking-[0.45em] text-[#E8D5B0] mb-8 uppercase">
              Baseball × Sports Science
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight text-white tracking-tight">
              スポーツの『なぜ』を、<br />
              科学で解く。
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-7 text-base md:text-lg text-[#999999] font-light leading-relaxed max-w-xl">
              選手・指導者・保護者へ。<br />
              論文が明かす、競技力向上の最前線。
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Link
              href="/blog"
              className="mt-12 inline-flex items-center gap-3 bg-[#E8D5B0] text-[#0A0A0A] px-8 py-4 text-sm font-bold tracking-widest hover:bg-white transition-colors duration-200"
            >
              最新記事を読む
            </Link>
          </FadeIn>
        </div>
        <ScrollIndicator />
      </section>

      {/* Target Badges */}
      <section className="bg-[#111111] border-y border-[#222222]">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <p className="text-xs text-[#999999] mb-6 tracking-[0.35em] uppercase">For</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {BADGES.map((b) => (
              <span
                key={b.label}
                className="bg-[#0A0A0A] border border-[#222222] text-[#999999] text-xs px-4 py-2 tracking-wide"
              >
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#999999] tracking-wide">
            すべての競技人のための、スポーツ科学メディア
          </p>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="bg-[#0A0A0A] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="font-serif text-2xl font-bold text-white">最新記事</h2>
              <Link
                href="/blog"
                className="text-xs text-[#E8D5B0] hover:text-white transition-colors tracking-wide"
              >
                すべて見る →
              </Link>
            </div>
          </FadeIn>
          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post, i) => (
                <FadeIn key={post.id} delay={i * 0.1}>
                  <PostCard post={post} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <p className="text-[#999999] text-center py-20">記事がありません</p>
          )}
        </div>
      </section>

      {/* Category Grid */}
      <section className="bg-[#111111] py-24 border-y border-[#222222]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="font-serif text-2xl font-bold text-white mb-12">
              カテゴリから探す
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#222222]">
            {CATEGORIES.map((cat, i) => {
              const wpCat = categoryMap[cat.slug];
              const Icon = cat.icon;
              return (
                <FadeIn key={cat.slug} delay={i * 0.07}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group bg-[#0A0A0A] p-8 flex flex-col gap-5 border-l-2 border-transparent hover:border-[#0D3320] transition-all duration-200 h-full"
                  >
                    <Icon size={26} className="text-[#E8D5B0]" strokeWidth={1.5} />
                    <div>
                      <span className="block font-serif text-base font-bold text-white group-hover:text-[#E8D5B0] transition-colors">
                        {cat.name}
                      </span>
                      <span className="mt-1 block text-xs text-[#999999]">
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

      {/* Target Navigation */}
      <section className="bg-[#0A0A0A] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="font-serif text-2xl font-bold text-white mb-12">
              あなたに合った記事を探す
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-[#222222]">
            {TARGET_CARDS.map((card, i) => (
              <FadeIn key={card.href} delay={i * 0.08}>
                <Link
                  href={card.href}
                  className="group bg-[#0A0A0A] p-8 flex items-center justify-between border border-[#222222] hover:border-[#E8D5B0] transition-colors duration-200 h-full"
                >
                  <span className="text-sm text-white font-medium group-hover:text-[#E8D5B0] transition-colors">
                    {card.label}
                  </span>
                  <span className="text-[#999999] group-hover:text-[#E8D5B0] transition-colors">
                    →
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-[#0D3320] py-24">
        <FadeIn>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-relaxed">
              指導者も、選手も、保護者も。<br />
              スポーツ科学の最新知見を、あなたの手元に。
            </h2>
            <p className="mt-5 text-[#E8D5B0] text-sm tracking-wide">
              論文ベースの記事を毎週配信。無料で読む。
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-2 bg-[#E8D5B0] text-[#0D3320] px-8 py-4 text-sm font-bold tracking-widest hover:bg-white transition-colors duration-200"
            >
              購読登録する
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
