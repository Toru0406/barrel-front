"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PRIMARY_NAV, MOBILE_NAV } from "@/lib/nav";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_URL;

export default function Header() {
  const [open, setOpen] = useState(false);

  // メニュー展開中は背面スクロールを固定
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      role="banner"
      className="sticky inset-x-0 top-0 z-[1000]"
      style={{ backgroundColor: "var(--c-green)" }}
    >
      <div
        className="mx-auto flex h-[56px] max-w-[1240px] items-center justify-between px-6"
      >
        {/* ロゴ（白抜き版を緑背景に）*/}
        <Link
          href="/"
          aria-label="BARREL ホームへ"
          className="flex flex-shrink-0 items-center"
        >
          <Image
            src="/logo/barrel-logo-footer.png"
            alt="BARREL"
            width={160}
            height={36}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* デスクトップ プライマリナビ */}
        <nav
          aria-label="プライマリナビゲーション"
          className="hidden items-center gap-6 lg:flex"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium tracking-wide transition-opacity hover:opacity-70"
              style={{ color: "var(--c-beige)", fontFamily: "var(--f-body)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右端: 検索アイコン + LINE ボタン + ハンバーガー */}
        <div className="flex items-center gap-3">
          {/* 検索アイコン（44px タッチターゲット確保） */}
          <Link
            href="/search"
            aria-label="記事を検索"
            className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: "var(--c-beige)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* LINEで受け取る（env 未設定時は非表示） */}
          {LINE_URL && (
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta hidden text-xs lg:inline-block"
            >
              LINEで受け取る
            </a>
          )}

          {/* ハンバーガー（モバイル） */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative z-[1001] flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          >
            <span
              className="block h-0.5 w-6 transition-transform duration-300"
              style={{
                backgroundColor: "var(--c-beige)",
                transform: open ? "translateY(7px) rotate(45deg)" : undefined,
              }}
            />
            <span
              className="block h-0.5 w-6 transition-opacity duration-150"
              style={{
                backgroundColor: "var(--c-beige)",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block h-0.5 w-6 transition-transform duration-300"
              style={{
                backgroundColor: "var(--c-beige)",
                transform: open ? "translateY(-7px) rotate(-45deg)" : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* モバイルメニュー（フルスクリーンオーバーレイ） */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="モバイルメニュー"
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "var(--c-green-deep)" }}
      >
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="text-lg tracking-[0.05em] transition-opacity hover:opacity-70"
            style={{ color: "var(--c-beige)", fontFamily: "var(--f-display)" }}
          >
            {item.label}
          </Link>
        ))}
        {/* LINE（モバイルメニュー内） */}
        {LINE_URL && (
          <a
            href={LINE_URL}
            rel="noopener"
            className="btn-cta mt-4 text-sm"
            onClick={() => setOpen(false)}
          >
            LINEで受け取る
          </a>
        )}
      </div>
    </header>
  );
}
