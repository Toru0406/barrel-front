interface Props {
  count: number;
}

/**
 * 出典N件バッジ（等幅、緑文字、細枠）。BARRELの論文依拠を示す Signature。
 * 一覧カードには出さない（件数は品質と相関しないのに「出典40件」と「出典2件」が
 * 並ぶと誤った序列になる）。記事ページのメタ行だけで使う。
 */
export default function EvidenceBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <span className="evidence-badge">
      出典 {count}件
    </span>
  );
}
