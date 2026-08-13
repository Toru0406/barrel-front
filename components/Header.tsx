"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PRIMARY_NAV, MOBILE_NAV } from "@/lib/nav";

// CMS（barrel-theme .site-header）と完全一致：ダークグリーン固定ヘッダー＋スクロールで縮小
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // メニュー展開中は背面スクロールを固定
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      role="banner"
      className={`sticky inset-x-0 top-0 z-[1000] bg-[#1a3d1f] transition-[height,box-shadow] duration-300 ${
        scrolled ? "h-14 shadow-md" : "h-[72px]"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-6">
        {/* ロゴ（モノクロ透過ロゴを mix-blend-screen でダーク背景に載せる＝CMS準拠） */}
        <Link
          href="/"
          aria-label="BARREL ホームへ"
          className="flex flex-shrink-0 items-center"
        >
          <Image
            src="/logo/barrel-logo-footer.png"
            alt="BARREL"
            width={200}
            height={44}
            priority
            className={`w-auto mix-blend-screen transition-[height] duration-300 ${
              scrolled ? "h-8" : "h-10"
            }`}
          />
        </Link>

        {/* デスクトップ・プライマリナビ（下線ホバーアニメーション） */}
        <nav
          aria-label="プライマリナビゲーション"
          className="hidden items-center gap-8 lg:flex"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 font-sans text-sm font-medium tracking-wide text-barrel-beige transition-colors hover:text-white"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-barrel-beige transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* ハンバーガー（モバイル） */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative z-[1001] flex flex-col gap-[5px] p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        >
          <span
            className={`block h-0.5 w-6 bg-barrel-beige transition-transform duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-barrel-beige transition-opacity duration-150 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-barrel-beige transition-transform duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* モバイルメニュー（フルスクリーンオーバーレイ） */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-[#112814] transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="font-serif text-xl tracking-[0.1em] text-barrel-beige transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
