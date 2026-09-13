interface Props {
  /** 広告・アフィリエイトを含む記事か（lib/wordpress の isSponsored の結果） */
  sponsored?: boolean;
  /** 緑帯の上に置くときは "band"（ベージュ）。既定は紙面上（インク色）。 */
  tone?: "default" | "band";
  className?: string;
}

/**
 * 一覧カードのPR表記。記事を開く前に広告記事だと分かるようにする。
 * 色面は使わず出典バッジと同じ矩形に揃えるが、文字色は本文と同じ濃さにして視認性を優先する。
 */
export default function PrBadge({ sponsored = false, tone = "default", className = "" }: Props) {
  if (!sponsored) return null;
  return (
    <span className={`pr-badge${tone === "band" ? " pr-badge--band" : ""} ${className}`.trim()}>
      PR
      <span className="sr-only">（広告・アフィリエイトを含む記事）</span>
    </span>
  );
}
