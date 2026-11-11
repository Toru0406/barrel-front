"use client";

import { useEffect, useState } from "react";

/**
 * スマホで記事を読んでいる間、画面下部に出す LINE 導線（2026-11-11 追加）。
 * ・記事を4割読み進めてから出す（読み始めを覆わない）
 * ・記事末尾の LINE 導線（#line-cta）が画面に入っている間は隠す（同じ導線を二重に並べない）
 * ・閉じたら、そのタブでは出さない（sessionStorage。使えない環境では閉じた状態を覚えないだけ）
 * 文言は LineInlineCta と同じく、LINE で実際にできること（関連記事を返す）だけを書く。
 */
const DISMISS_KEY = "barrel-line-bar-dismissed";
const SHOW_AFTER = 0.4;

export default function LineStickyBar({ lineUrl }: { lineUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try { setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1"); } catch { setDismissed(false); }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(max > 0 && window.scrollY / max >= SHOW_AFTER);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const footer = document.getElementById("line-cta");
    const io = footer ? new IntersectionObserver(([e]) => setFooterVisible(!!e?.isIntersecting)) : null;
    if (footer && io) io.observe(footer);
    return () => { window.removeEventListener("scroll", onScroll); io?.disconnect(); };
  }, []);

  if (dismissed || !scrolled || footerVisible) return null;

  const close = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* 覚えられなくても閉じる */ }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{
        backgroundColor: "var(--c-green)",
        color: "var(--c-paper)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -1px 0 var(--c-line)",
      }}
      role="region"
      aria-label="LINE 相談の案内"
    >
      <div className="flex items-center gap-s-3 px-s-4 py-s-3">
        <p className="flex-1 min-w-0" style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-xs)", lineHeight: 1.5 }}>
          状況を送ると、関連する記事をLINEでお返しします
        </p>
        <a
          href={lineUrl}
          rel="noopener"
          data-line-pos="sticky"
          className="flex-shrink-0 rounded-[var(--r-1)] px-s-3 py-s-2 min-h-[44px] inline-flex items-center"
          style={{ backgroundColor: "var(--c-beige)", color: "var(--c-green)", fontFamily: "var(--f-body)", fontSize: "var(--t-xs)", fontWeight: 700 }}
        >
          LINEで相談
        </a>
        <button
          type="button"
          onClick={close}
          aria-label="閉じる"
          className="flex-shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          style={{ color: "var(--c-paper)", fontSize: "var(--t-lg)" }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
