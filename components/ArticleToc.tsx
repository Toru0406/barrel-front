"use client";

import { useState, useEffect, useRef } from "react";
import type { Heading } from "@/lib/article";

interface Props {
  headings: Heading[];
  /** inline: 本文冒頭の折りたたみ（モバイル） / floating: 画面右上に固定し、ホバー・クリックで開く（デスクトップ） */
  variant: "inline" | "floating";
}

// ボタンから一覧へカーソルを移す途中で閉じないよう、閉じる操作だけ少し遅らせる
const CLOSE_DELAY_MS = 150;
// 固定ヘッダー（Header.tsx の h-[56px]）の裏に入った見出しを「現在の節」と判定しないよう、判定帯をヘッダーの下から始める
const ACTIVE_ROOT_MARGIN = "-56px 0px -70% 0px";

/**
 * 記事目次コンポーネント（クライアント）。
 *
 * レンダリングルール（親側で制御する）:
 *   - モバイル: <div className="lg:hidden"> で囲み variant="inline"
 *   - デスクトップ: <div className="hidden lg:block"> で囲み variant="floating"
 *
 * IntersectionObserver でアクティブセクションをハイライトする。
 * キーボードアクセシブル（フォーカス可能な <a> リスト、Escape で閉じる）。
 */
export default function ArticleToc({ headings, variant }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

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
        rootMargin: ACTIVE_ROOT_MARGIN,
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    if (!open) return;
    // 見出しが多い記事では現在地が一覧の外に隠れるため、開いたら現在の項目まで一覧をスクロールする
    panelRef.current?.querySelector('[aria-current="location"]')?.scrollIntoView({ block: "nearest" });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // タッチ操作ではホバーが外れないため、一覧の外を押したら閉じる
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  if (!headings.length) return null;

  // モバイルの折りたたみとデスクトップの一覧で同じ見た目（14px・本文色・現在地は左罫と背景）にする
  const tocList = (onNavigate?: () => void) => (
    <nav aria-label="目次">
      <ol>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={() => {
                // 移動直後は判定帯に見出しが入らないことがあるため、選んだ項目をその場で現在地にする
                setActiveId(h.id);
                onNavigate?.();
              }}
              aria-current={activeId === h.id ? "location" : undefined}
              className={`toc-link${h.level === 3 ? " toc-link--sub" : ""}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  if (variant === "inline") {
    return (
      <details
        className="border"
        style={{ borderColor: "var(--c-line, #D9D7CE)" }}
      >
        <summary
          className="cursor-pointer select-none px-4 py-3 text-sm font-bold"
          style={{
            fontFamily: "var(--f-body)",
            color: "var(--c-ink, #14201A)",
            backgroundColor: "var(--c-paper-2, #EFEDE6)",
          }}
        >
          目次
        </summary>
        <div className="px-2 py-3">{tocList()}</div>
      </details>
    );
  }

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  return (
    <div
      ref={rootRef}
      className="toc-float"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      {/* ホバーで開いた直後のクリックで閉じてしまわないよう、クリックは開くだけにする */}
      <button
        type="button"
        className="toc-float-button"
        aria-expanded={open}
        aria-controls="toc-float-panel"
        onClick={show}
        onFocus={show}
      >
        目次
      </button>
      <div id="toc-float-panel" ref={panelRef} className="toc-float-panel" hidden={!open}>
        <p className="toc-float-label">目次</p>
        {tocList(() => setOpen(false))}
      </div>
    </div>
  );
}
