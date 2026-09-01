import Link from "next/link";
import Image from "next/image";
import {
  getPosts,
  getPostBySlug,
  getCategories,
  getFeaturedImage,
  getPostCategories,
  formatDateDot,
  readingTimeMin,
  WPPost,
} from "@/lib/wordpress";
import { getPopularSlugs } from "@/lib/ga4";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import "./home.css";

function toHeroSlide(post: WPPost): HeroSlide {
  const cat = getPostCategories(post)[0];
  const img = getFeaturedImage(post);
  return {
    slug: post.slug,
    title: post.title.rendered,
    dateLabel: formatDateDot(post.date),
    readingMin: readingTimeMin(post),
    category: cat
      ? { name: cat.name, href: `/category/${decodeURIComponent(cat.slug)}` }
      : null,
    image: img ? { src: img.src, alt: img.alt } : null,
  };
}

export const revalidate = 60;

// CMSホームと同じカテゴリ別カルーセル構成（altは背景色の交互切り替え）
const CATEGORY_SECTIONS = [
  { slug: "coaching", name: "指導・育成", alt: true },
  { slug: "conditioning", name: "コンディショニング", alt: false },
  { slug: "management", name: "チーム運営", alt: true },
  { slug: "training", name: "トレーニング", alt: false },
];

function ArticleCard({ post }: { post: WPPost }) {
  const image = getFeaturedImage(post);
  const cat = getPostCategories(post)[0];
  return (
    <article className="article-card">
      <Link href={`/articles/${post.slug}`} className="article-card__image-wrap">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="article-card__image"
          />
        ) : (
          <span className="article-card__image" aria-hidden="true" />
        )}
      </Link>
      <div className="article-card__body">
        {cat && (
          <Link
            href={`/category/${decodeURIComponent(cat.slug)}`}
            className="article-card__category"
          >
            {cat.name}
          </Link>
        )}
        <h2 className="article-card__title">
          <Link
            href={`/articles/${post.slug}`}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </h2>
        <footer className="article-card__meta">
          <time>{formatDateDot(post.date)}</time>
          <span className="article-card__meta-separator">/</span>
          <span>{readingTimeMin(post)}分で読める</span>
        </footer>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [latest, categories] = await Promise.all([
    getPosts({ perPage: 12 }).catch(() => ({ posts: [], total: 0, totalPages: 0 })),
    getCategories().catch(() => []),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // ヒーローはGA4の閲覧数上位（人気記事）をスライドショー表示（5秒自動遷移）。
  // GA4未取得や人気記事が少ない場合は最新記事にフォールバックする。
  const popularSlugs = await getPopularSlugs(8).catch(() => [] as string[]);
  let heroPosts: WPPost[] = [];
  if (popularSlugs.length > 0) {
    const resolved = await Promise.all(
      popularSlugs.map((slug) => getPostBySlug(slug).catch(() => null))
    );
    heroPosts = resolved.filter((p): p is WPPost => p !== null).slice(0, 5);
  }
  if (heroPosts.length < 2) heroPosts = latest.posts.slice(0, 5);

  const heroSlides: HeroSlide[] = heroPosts.map(toHeroSlide);

  // 最新記事グリッドはヒーローと重複しない最新6件
  const heroSlugSet = new Set(heroPosts.map((p) => p.slug));
  const grid = latest.posts.filter((p) => !heroSlugSet.has(p.slug)).slice(0, 6);

  const sections = await Promise.all(
    CATEGORY_SECTIONS.map(async (sec) => {
      const wpCat = catMap[sec.slug];
      const posts = wpCat
        ? (
            await getPosts({ categoryId: wpCat.id, perPage: 6 }).catch(() => ({
              posts: [] as WPPost[],
            }))
          ).posts
        : [];
      return { ...sec, posts };
    })
  );

  return (
    <div className="barrel-home">
      {/* ヒーロー（注目記事スライドショー・5秒自動遷移） */}
      <HeroCarousel slides={heroSlides} />

      {/* 最新記事 */}
      {grid.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">最新記事</h2>
              <Link href="/blog" className="section-link">
                すべて見る →
              </Link>
            </div>
            <div className="card-grid">
              {grid.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* カテゴリ別カルーセル */}
      {sections.map(
        (sec) =>
          sec.posts.length > 0 && (
            <section
              key={sec.slug}
              className={`section carousel-section${sec.alt ? " section--alt" : ""}`}
            >
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">{sec.name}</h2>
                  <Link href={`/category/${sec.slug}`} className="section-link">
                    カテゴリをすべて見る →
                  </Link>
                </div>
                <div className="carousel">
                  {sec.posts.map((post) => (
                    <div key={post.id} className="carousel__item">
                      <ArticleCard post={post} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
      )}
    </div>
  );
}
