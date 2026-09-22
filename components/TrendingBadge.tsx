interface Props {
  /** GA4 の直近90日PV上位（TRENDING_COUNT本）に入っているか */
  trending?: boolean;
}

/**
 * 「よく読まれている」印。PVの実数は出さず、上位N本にだけ付ける相対表示。
 * メタ行ではカテゴリの次に従属させたいので、枠も罫も持たせず日付と同じ muted で示す。
 */
export default function TrendingBadge({ trending = false }: Props) {
  if (!trending) return null;
  return (
    <span className="trending-badge">
      MOST READ
      <span className="sr-only">（よく読まれている記事）</span>
    </span>
  );
}
