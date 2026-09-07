import type { KeyPointsData } from "@/lib/article";

interface Props {
  data: KeyPointsData;
}

/**
 * 「この記事の要点」ボックス。
 * h2 が2件未満のときは非表示。
 * paper-2 背景 + 緑左ルール (DESIGN.md 準拠)。
 */
export default function KeyPoints({ data }: Props) {
  if (data.items.length < 2) return null;

  return (
    <div
      className="my-8 border-l-[3px] px-6 py-5"
      style={{
        borderColor: "var(--c-green, #0D3320)",
        backgroundColor: "var(--c-paper-2, #EFEDE6)",
      }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-3"
        style={{
          fontFamily: "var(--font-oswald, ui-sans-serif)",
          fontWeight: 500,
          color: "var(--c-ink-muted, #5F6B64)",
          letterSpacing: "0.12em",
        }}
      >
        この記事の要点
      </p>
      <ul className="space-y-2 mb-4">
        {data.items.map((item, i) => (
          <li
            key={i}
            className="font-sans text-sm leading-relaxed"
            style={{ color: "var(--c-ink, #14201A)" }}
          >
            {item}
          </li>
        ))}
      </ul>
      {data.firstHeadingId && (
        <a
          href={`#${data.firstHeadingId}`}
          className="font-sans text-xs border-b transition-opacity hover:opacity-70"
          style={{
            color: "var(--c-green, #0D3320)",
            borderColor: "var(--c-green, #0D3320)",
          }}
        >
          本文を読む ↓
        </a>
      )}
    </div>
  );
}
