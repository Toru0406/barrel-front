interface Props {
  /** GA4 の直近90日PV上位（TRENDING_COUNT本）に入っているか */
  trending?: boolean;
}

/**
 * 「よく読まれている」印。PVの実数は出さず、上位N本にだけ付ける相対表示。
 * 出典N件バッジ（Signature）より従属させるため、枠は持たせず緑の3px罫だけで示す。
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
