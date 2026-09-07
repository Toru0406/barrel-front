import Link from "next/link";
import Image from "next/image";
import { getFeaturedImage, formatDateDot } from "@/lib/wordpress";
import type { WPPost } from "@/lib/wordpress";

interface Props {
  posts: WPPost[];
}

/**
 * 関連記事 (同じハブ/カテゴリから最大3件)。
 * ArticleListItem が未着のため、ここで直接レンダリングする。
 * TODO: foundation builder が ArticleListItem を納品したら置き換える。
 */
export default function RelatedArticles({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section className="mt-16 pt-8 border-t" style={{ borderColor: "var(--c-line, #D9D7CE)" }}>
      <h2
        className="text-xs uppercase tracking-widest mb-6"
        style={{
          fontFamily: "var(--font-oswald, ui-sans-serif)",
          fontWeight: 500,
          color: "var(--c-ink-muted, #5F6B64)",
          letterSpacing: "0.12em",
        }}
      >
        同じテーマの記事
      </h2>

      <div className="space-y-6">
        {posts.map((post) => {
          const img = getFeaturedImage(post);
          const title = post.title.rendered.replace(/<[^>]+>/g, "");
          return (
            <Link
              key={post.id}
              href={`/articles/${post.slug}`}
              className="flex gap-4 group"
            >
              {img && (
                <div
                  className="w-24 h-16 flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: "var(--c-paper-2, #EFEDE6)" }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={96}
                    height={64}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="font-sans text-sm font-medium leading-snug line-clamp-2 transition-colors"
                  style={{ color: "var(--c-ink, #14201A)" }}
                >
                  {title}
                </p>
                <time
                  className="font-mono text-xs mt-1 block"
                  style={{ color: "var(--c-ink-muted, #5F6B64)" }}
                  dateTime={post.date}
                >
                  {formatDateDot(post.date)}
                </time>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
