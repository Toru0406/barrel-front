import Link from "next/link";
import Image from "next/image";
import {
  getPosts,
  getCategories,
  getFeaturedImage,
  getPostCategories,
  formatDateDot,
  readingTimeMin,
  WPPost,
} from "@/lib/wordpress";
import "./home.css";

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
    getPosts({ perPage: 7 }).catch(() => ({ posts: [], total: 0, totalPages: 0 })),
    getCategories().catch(() => []),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const hero = latest.posts[0] ?? null;
  const grid = latest.posts.slice(1, 7);

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

  const heroImage = hero ? getFeaturedImage(hero) : null;
  const heroCat = hero ? getPostCategories(hero)[0] : null;

  return (
    <div className="barrel-home">
      {/* ヒーロー（注目記事） */}
      {hero && (
        <section className="hero">
          {heroImage && (
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              sizes="100vw"
              className="hero__image"
            />
          )}
          <div className="hero__overlay" />
          <div className="hero__content">
            <div className="container">
              {heroCat && (
                <Link
                  href={`/category/${decodeURIComponent(heroCat.slug)}`}
                  className="hero__category"
                >
                  {heroCat.name}
                </Link>
              )}
              <h1 className="hero__title">
                <Link
                  href={`/articles/${hero.slug}`}
                  dangerouslySetInnerHTML={{ __html: hero.title.rendered }}
                />
              </h1>
              <div className="hero__meta">
                <time>{formatDateDot(hero.date)}</time>
                <span className="hero__meta-separator">—</span>
                <span>{readingTimeMin(hero)}分で読める</span>
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* ニュースレターCTA */}
      <section className="section newsletter-cta">
        <div className="container newsletter-cta__inner">
          <p className="newsletter-cta__eyebrow">BARREL Newsletter</p>
          <h2 className="newsletter-cta__title">
            指導者の学びが、
            <br />
            アマチュアスポーツの現場を変える。
          </h2>
          <p className="newsletter-cta__desc">
            競技を問わず、現場で戦うすべての指導者へ。
            <br />
            コーチング・スポーツ科学・チーム運営——
            <br />
            現場に直結する知識を、毎週お届けします。
          </p>
          <Link href="/blog" className="newsletter-cta__btn">
            最新記事を受け取る
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
