/**
 * 記事の本文中に置く LINE 導線（2026-11-11 追加）。NEXT_PUBLIC_LINE_ADD_URL 未設定時は何も描画しない。
 *
 * 記事末尾の LineCta だけでは、直近28日で訪問者247人・LINEクリック0回だった（1人あたり1.15ページで、
 * 末尾まで届く前に離れる読者が大半）。本文の途中、読者がテーマに入り込んでいる位置に置く。
 *
 * ★文言は LINE で実際にできること（相談文から関連記事を最大3本返す。src は lib/line.ts）に合わせる。
 *   特典（チェックリスト等）は無いので約束しない。応答メッセージは無料プランの通数に数えられない。
 */
export default function LineInlineCta({ topic }: { topic?: string }) {
  const lineUrl = process.env.NEXT_PUBLIC_LINE_ADD_URL;
  if (!lineUrl) return null;
  return (
    <aside
      className="my-s-7 py-s-4"
      style={{ borderTop: "var(--lw-3) solid var(--c-green)", borderBottom: "var(--lw-1) solid var(--c-line)" }}
      aria-label="LINE 相談の案内"
    >
      <p
        className="mb-s-2"
        style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-lg)", fontWeight: 700, letterSpacing: "0.02em", color: "var(--c-ink)" }}
      >
        {topic ? `「${topic}」で気になることは、LINEで` : "気になることは、LINEで"}
      </p>
      <p className="mb-s-3" style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sm)", color: "var(--c-ink-muted)", lineHeight: 1.7 }}>
        いまの状況を一言送ると、研究にあたって書いた関連記事をお返しします。
      </p>
      <a href={lineUrl} rel="noopener" className="btn-cta" data-line-pos="inline">
        LINE で相談する（無料）
      </a>
    </aside>
  );
}
