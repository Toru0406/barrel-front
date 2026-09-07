import Link from "next/link";
import Image from "next/image";
import { WPPost, getFeaturedImage, getPostCategories, formatDateDot, evidenceCount } from "@/lib/wordpress";
import Eyebrow from "./Eyebrow";
import EvidenceBadge from "./EvidenceBadge";

interface Props {
  post: WPPost;
  showThumbnail?: boolean;
}

/**
 * テキスト密度の高いリスト行。
 * eyebrow カテゴリ · display フォントタイトル · mono 日付 · 出典バッジ
 * サムネイルは optional（右側 96px 固定）。
 */
export default function ArticleListItem({ post, showThumbnail = true }: Props) {
  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const firstCat = categories[0];
  const count = evidenceCount(post);

  return (
    <article>
      <Link
        href={`/articles/${post.slug}`}
        className="flex items-start gap-s-4 py-s-3 border-b transition-opacity hover:opacity-75"
        style={{ borderColor: "var(--c-line)" }}
      >
        {/* テキスト部 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-s-3 mb-1">
            {firstCat && (
              <Eyebrow>{firstCat.name}</Eyebrow>
            )}
            <EvidenceBadge count={count} />
          </div>
          <h2
            className="line-clamp-3 leading-snug"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-base)",
              fontWeight: 700,
              color: "var(--c-ink)",
              letterSpacing: "0.02em",
            }}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <time
            dateTime={post.date}
            className="mt-1 block"
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "var(--t-xs)",
              color: "var(--c-ink-muted)",
            }}
          >
            {formatDateDot(post.date)}
          </time>
        </div>

        {/* サムネイル（96×64 固定、アスペクト比ボックス） */}
        {showThumbnail && image && (
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{ width: 96, height: 64 }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        )}
      </Link>
    </article>
  );
}
