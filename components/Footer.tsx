import Link from "next/link";
import Image from "next/image";
import { FOOTER_CATEGORIES, SOCIAL_LINKS } from "@/lib/nav";

// CMS（barrel-theme .site-footer）と完全一致：ダークグリーン背景・3カラムグリッド
export default function Footer() {
  return (
    <footer role="contentinfo" className="bg-[#112814] pt-16 text-barrel-beige">
      <div className="mx-auto max-w-[1240px] px-6">
        {/* footer-inner: ブランド / カテゴリ */}
        <div className="grid grid-cols-1 gap-8 border-b border-barrel-beige/15 pb-12 sm:grid-cols-2 lg:grid-cols-[200px_1fr] lg:gap-12">
          {/* ブランドエリア */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Link href="/" aria-label="BARREL ホームへ">
                <Image
                  src="/logo/barrel-logo-footer.png"
                  alt="BARREL"
                  width={200}
                  height={52}
                  className="h-11 w-auto mix-blend-screen"
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-barrel-beige/60">
              スポーツを深く考える、すべてのプレーヤー・指導者へ。
            </p>

            {/* SNSリンク */}
            <div className="mt-5 flex gap-4" aria-label="ソーシャルメディア">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-barrel-beige/25 text-barrel-beige transition-colors hover:border-barrel-beige hover:bg-barrel-beige/15"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* カテゴリナビ */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-barrel-beige/50">
              カテゴリ
            </p>
            <ul className="flex flex-col gap-2">
              {FOOTER_CATEGORIES.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="text-sm text-barrel-beige/70 transition-colors hover:text-barrel-beige"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* footer-bottom */}
        <div className="flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-barrel-beige/50 sm:flex-row sm:text-left">
          <span>© 2026 BARREL. All rights reserved.</span>
          <span>本サイトの記事・画像の無断転載・無断使用を禁止します。</span>
        </div>
      </div>
    </footer>
  );
}
