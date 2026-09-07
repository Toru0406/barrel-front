interface Props {
  count: number;
}

/** 出典N件バッジ（等幅、緑文字、細枠）。BARRELの論文依拠を毎カードで証明する情報要素。 */
export default function EvidenceBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <span className="evidence-badge">
      出典 {count}件
    </span>
  );
}
