import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  getFeaturedImage,
  getPostCategories,
  formatDateDot,
  evidenceCount,
} from "@/lib/wordpress";
import EvidenceBadge from "./EvidenceBadge";
import TrendingBadge from "./TrendingBadge";

interface Props {
  post: WPPost;
  /** GA4 のPV上位に入っている記事に「よく読まれている」印を出す */
  trending?: boolean;
}

export default function PostCard({ post, trending = false }: Props) {
  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const firstCat = categories[0];
  const count = evidenceCount(post);

  return (
    <article
      style={{
        border: "1px solid var(--c-line)",
        backgroundColor: "var(--c-paper)",
      }}
    >
      <Link href={`/articles/${post.slug}`} className="group block">
        {/* サムネイル（アスペクト比 16:9 固定で CLS 防止） */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: "var(--c-paper-2)" }} />
          )}
        </div>

        {/* カード本文 */}
        <div className="p-s-4">
          <div className="flex flex-wrap items-center gap-x-s-2 gap-y-s-1 mb-s-2">
            {firstCat && (
              /* badge クラスは app/blog/[slug]/page.tsx との互換のため保持 */
              <span className="badge">{firstCat.name}</span>
            )}
            <EvidenceBadge count={count} />
            <TrendingBadge trending={trending} />
          </div>

          <h2
            className="line-clamp-2 mb-s-2"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-base)",
              fontWeight: 700,
              lineHeight: 1.4,
              letterSpacing: "0.02em",
              color: "var(--c-ink)",
            }}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          <time
            dateTime={post.date}
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "var(--t-xs)",
              color: "var(--c-ink-muted)",
            }}
          >
            {formatDateDot(post.date)}
          </time>
        </div>
      </Link>
    </article>
  );
}
