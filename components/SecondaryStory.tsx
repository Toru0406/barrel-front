import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  getFeaturedImage,
  getPostCategories,
  formatDateDot,
  evidenceCount,
} from "@/lib/wordpress";
import Eyebrow from "./Eyebrow";
import EvidenceBadge from "./EvidenceBadge";

interface Props {
  post: WPPost;
}

/**
 * サブストーリー: 左に小画像、右にタイトル。
 * LeadStory の横に 2本並べるレイアウト向け。
 */
export default function SecondaryStory({ post }: Props) {
  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const firstCat = categories[0];
  const count = evidenceCount(post);

  return (
    <article>
      <Link
        href={`/articles/${post.slug}`}
        className="group flex gap-s-4 transition-opacity hover:opacity-75"
      >
        {/* 左: 小画像（アスペクト比固定で CLS 防止） */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: 120, aspectRatio: "4/3" }}
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="120px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: "var(--c-paper-2)" }} />
          )}
        </div>

        {/* 右: テキスト */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-s-2 mb-1">
            {firstCat && <Eyebrow>{firstCat.name}</Eyebrow>}
            <EvidenceBadge count={count} />
          </div>
          <h2
            className="line-clamp-3"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-sm)",
              fontWeight: 700,
              lineHeight: 1.4,
              letterSpacing: "0.02em",
              color: "var(--c-ink)",
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
      </Link>
    </article>
  );
}
