import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  getFeaturedImage,
  getPostCategories,
  formatDateDot,
  readingTimeMin,
  leadParagraph,
  evidenceCount,
  isSponsored,
} from "@/lib/wordpress";
import Eyebrow from "./Eyebrow";
import EvidenceBadge from "./EvidenceBadge";
import TrendingBadge from "./TrendingBadge";
import PrBadge from "./PrBadge";

interface Props {
  post: WPPost;
  /** GA4 のPV上位に入っている記事に「よく読まれている」印を出す */
  trending?: boolean;
}

/**
 * リードストーリー: 16:9 大画像 + eyebrow + hero タイトル + リード段落 + メタ。
 * eyebrow → 見出し → 要約の順に .rise アニメーション（--i で 60ms 刻み）。
 */
export default function LeadStory({ post, trending = false }: Props) {
  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);
  const firstCat = categories[0];
  const lead = leadParagraph(post);
  const count = evidenceCount(post);
  const sponsored = isSponsored(post);

  return (
    <article>
      <Link href={`/articles/${post.slug}`} className="group block">
        {/* 16:9 画像（CLS 防止のためアスペクト比固定） */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 800px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ backgroundColor: "var(--c-paper-2)" }}
            />
          )}
        </div>

        {/* テキストエリア */}
        <div className="pt-s-4">
          {/* eyebrow: --i:0 */}
          <div className="rise flex flex-wrap items-center gap-x-s-3 gap-y-s-1 mb-s-2" style={{ "--i": 0 } as React.CSSProperties}>
            <PrBadge sponsored={sponsored} />
            {firstCat && <Eyebrow>{firstCat.name}</Eyebrow>}
            <EvidenceBadge count={count} />
            <TrendingBadge trending={trending} />
          </div>

          {/* hero タイトル: --i:1 */}
          <h2
            className="rise title-hero"
            style={{ "--i": 1 } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* リード段落: --i:2 */}
          {lead && (
            <p
              className="rise mt-s-3 dek"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              {lead}
            </p>
          )}

          {/* メタ（日付・読了時間） */}
          <div className="mt-s-3 flex items-center gap-s-3">
            <time
              dateTime={post.date}
              style={{ fontFamily: "var(--f-mono)", fontSize: "var(--t-xs)", color: "var(--c-ink-muted)" }}
            >
              {formatDateDot(post.date)}
            </time>
            <span style={{ color: "var(--c-line)" }}>—</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--t-xs)", color: "var(--c-ink-muted)" }}>
              {readingTimeMin(post)}分で読める
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
