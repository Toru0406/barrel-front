import Link from "next/link";

interface Props {
  title: string;
  allHref?: string;
  allLabel?: string;
}

/**
 * セクション見出し: 緑の3px上罫 + タイトル + 任意の「すべて見る」リンク。
 * 長いタイトルでも折り返しを許容（line-clamp なし）。
 */
export default function SectionHeading({ title, allHref, allLabel = "すべて見る" }: Props) {
  return (
    <div
      className="rule-green flex items-baseline justify-between pt-s-2 mb-s-5"
    >
      <h2
        style={{
          fontFamily: "var(--f-display)",
          fontSize: "var(--t-xl)",
          fontWeight: 700,
          letterSpacing: "0.02em",
          fontFeatureSettings: '"palt" 1',
          color: "var(--c-ink)",
        }}
      >
        {title}
      </h2>
      {allHref && (
        <Link
          href={allHref}
          className="flex-shrink-0 ml-s-4 transition-opacity hover:opacity-70"
          style={{
            fontFamily: "var(--f-body)",
            fontSize: "var(--t-sm)",
            color: "var(--c-ink-muted)",
          }}
        >
          {allLabel}
        </Link>
      )}
    </div>
  );
}
