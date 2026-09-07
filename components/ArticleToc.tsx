"use client";

import { useState, useEffect } from "react";
import type { Heading } from "@/lib/article";

interface Props {
  headings: Heading[];
}

/**
 * 記事目次コンポーネント（クライアント）。
 *
 * レンダリングルール（親側で制御する）:
 *   - モバイル: <div className="lg:hidden"> で囲んで使う → details が見える
 *   - デスクトップ: aside.hidden.lg:block 内に配置 → hidden lg:block div が見える
 *
 * IntersectionObserver でアクティブセクションをハイライトする。
 * キーボードアクセシブル（フォーカス可能な <a> リスト）。
 */
export default function ArticleToc({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 最も上にある交差中の要素をアクティブにする
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting[0]) setActiveId(intersecting[0].target.id);
      },
      {
        rootMargin: "-10% 0% -70% 0%",
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const tocItems = (
    <nav aria-label="目次">
      <ol className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${h.id}`}
              className="block py-1.5 font-sans text-xs leading-snug transition-colors"
              style={{
                color:
                  activeId === h.id
                    ? "var(--c-green, #0D3320)"
                    : "var(--c-ink-muted, #5F6B64)",
                fontWeight: activeId === h.id ? 600 : 400,
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <>
      {/* モバイル: 折りたたみ式 */}
      <details
        className="lg:hidden border"
        style={{ borderColor: "var(--c-line, #D9D7CE)" }}
      >
        <summary
          className="cursor-pointer select-none px-4 py-3 text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-oswald, ui-sans-serif)",
            fontWeight: 500,
            color: "var(--c-ink-muted, #5F6B64)",
            backgroundColor: "var(--c-paper-2, #EFEDE6)",
          }}
        >
          目次
        </summary>
        <div
          className="px-4 pb-4 pt-2"
          style={{ backgroundColor: "var(--c-paper-2, #EFEDE6)" }}
        >
          {tocItems}
        </div>
      </details>

      {/* デスクトップ: インライン表示（親の aside で sticky を制御） */}
      <div className="hidden lg:block">
        <p
          className="mb-3 text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-oswald, ui-sans-serif)",
            fontWeight: 500,
            color: "var(--c-ink-muted, #5F6B64)",
            letterSpacing: "0.12em",
          }}
        >
          目次
        </p>
        {tocItems}
      </div>
    </>
  );
}
