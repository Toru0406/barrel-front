"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * 本文内のアフィリエイトリンクのクリックを GA4 に送る。
 * 本文は dangerouslySetInnerHTML で入るため個別に onClick を付けられず、document への委譲で拾う。
 * link_position は生成側が付ける data-barrel-aff（picks / product / summary / cta）。無ければ本文中のテキストリンク。
 */
export default function AffiliateClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const a = target?.closest('a[href*="af.moshimo.com"]');
      if (!a) return;
      trackEvent({
        action: "affiliate_click",
        category: "affiliate",
        label: (a.textContent ?? "").trim().slice(0, 80),
        link_position: a.getAttribute("data-barrel-aff") ?? "inline",
        item_index: a.getAttribute("data-barrel-item") ?? "",
        page_path: window.location.pathname,
      });
    };
    // 中クリック（新しいタブで開く）も成果につながるため auxclick も拾う
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);

  return null;
}
