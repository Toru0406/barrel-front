"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * LINE 友だち追加リンクのクリックを、どの導線から押されたか（data-line-pos）付きで GA4 に送る（2026-11-11 追加）。
 * 合計は従来どおり外部リンククリック（lin.ee）で数えられている（theme-engine の ga4.ts）。これは位置ごとの内訳を見るため。
 * 位置: inline（本文中）/ sticky（スマホ下部）/ footer（記事末尾・トップ）/ header（ヘッダー）
 */
export default function LineClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const a = target?.closest('a[href*="lin.ee"], a[href*="line.me"]');
      if (!a) return;
      trackEvent({
        action: "line_click",
        category: "line",
        link_position: a.getAttribute("data-line-pos") ?? "other",
        page_path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
