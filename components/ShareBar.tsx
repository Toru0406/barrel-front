"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

/**
 * シェアバー（クライアント）。
 * X (Twitter) / LINE / リンクコピー の3ボタン。
 * タップターゲット 44px。外部スクリプト不使用。
 * コピー完了は aria-live で告知する。
 */
export default function ShareBar({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const xUrl = `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encoded}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // navigator.clipboard が使えない環境向けフォールバック
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnClass =
    "flex items-center justify-center transition-colors" +
    " hover:opacity-80";
  const btnStyle = {
    width: 44,
    height: 44,
    border: "1px solid var(--c-line, #D9D7CE)",
    color: "var(--c-ink, #14201A)",
    backgroundColor: "transparent",
    cursor: "pointer",
  } as const;

  return (
    <div
      className="flex flex-wrap items-center gap-3 my-10 py-6 border-t"
      style={{ borderColor: "var(--c-line, #D9D7CE)" }}
    >
      <span
        className="text-xs uppercase tracking-widest mr-2"
        style={{
          fontFamily: "var(--font-oswald, ui-sans-serif)",
          fontWeight: 500,
          color: "var(--c-ink-muted, #5F6B64)",
          letterSpacing: "0.12em",
        }}
      >
        シェア
      </span>

      {/* X */}
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        style={btnStyle}
        aria-label="X でシェア"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LINE */}
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        style={btnStyle}
        aria-label="LINE でシェア"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
          <path d="M24 4C12.954 4 4 11.87 4 21.5c0 6.2 3.675 11.657 9.231 14.913-.362 1.32-1.31 4.786-1.5 5.523-.24.931.34.92.71.67.303-.2 4.812-3.225 6.763-4.516C21.04 38.36 22.5 38.5 24 38.5c11.046 0 20-7.87 20-17.5S35.046 4 24 4z"/>
        </svg>
      </a>

      {/* コピー */}
      <button
        type="button"
        onClick={handleCopy}
        className={btnClass}
        style={btnStyle}
        aria-label="リンクをコピー"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      <span
        role="status"
        aria-live="polite"
        className="font-sans text-xs transition-opacity duration-300"
        style={{
          color: "var(--c-green, #0D3320)",
          opacity: copied ? 1 : 0,
        }}
      >
        コピーしました
      </span>
    </div>
  );
}
