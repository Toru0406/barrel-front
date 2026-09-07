import Link from "next/link";
import Image from "next/image";
import { FOOTER_CATEGORIES, SOCIAL_LINKS } from "@/lib/nav";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{ backgroundColor: "var(--c-green)", color: "var(--c-beige)" }}
    >
      <div className="mx-auto max-w-[1240px] px-6 pt-14 pb-0">
        {/* メインエリア */}
        <div
          className="grid grid-cols-1 gap-8 border-b pb-12 sm:grid-cols-2 lg:grid-cols-[220px_1fr_1fr] lg:gap-12"
          style={{ borderColor: "color-mix(in srgb, var(--c-beige) 15%, transparent)" }}
        >
          {/* ブランドエリア */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="BARREL ホームへ" className="mb-4 inline-block">
              <Image
                src="/logo/barrel-logo-footer.png"
                alt="BARREL"
                width={180}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "color-mix(in srgb, var(--c-beige) 60%, transparent)" }}
            >
              研究に基づくスポーツ科学メディア。<br />
              指導者・選手・保護者へ。
            </p>

            {/* SNSリンク */}
            <div className="mt-5 flex gap-3" aria-label="ソーシャルメディア">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center border transition-opacity hover:opacity-70"
                  style={{
                    borderColor: "color-mix(in srgb, var(--c-beige) 25%, transparent)",
                    color: "var(--c-beige)",
                  }}
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

          {/* ハブ一覧 */}
          <div>
            <p
              className="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: "color-mix(in srgb, var(--c-beige) 50%, transparent)", fontFamily: "var(--f-utility)" }}
            >
              ハブ一覧
            </p>
            <ul className="flex flex-col gap-2">
              {FOOTER_CATEGORIES.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: "color-mix(in srgb, var(--c-beige) 70%, transparent)" }}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 編集方針・PR表記 */}
          <div>
            <p
              className="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: "color-mix(in srgb, var(--c-beige) 50%, transparent)", fontFamily: "var(--f-utility)" }}
            >
              メディアについて
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "color-mix(in srgb, var(--c-beige) 70%, transparent)" }}
                >
                  編集方針
                </Link>
              </li>
              <li>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "color-mix(in srgb, var(--c-beige) 45%, transparent)" }}
                >
                  PR表記について：本サイトには広告・PR記事が含まれます。
                  広告収入は独立した編集方針に影響を与えません。
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* フッター下段 */}
        <div
          className="flex flex-col items-center justify-between gap-3 py-5 text-center text-xs sm:flex-row sm:text-left"
          style={{
            backgroundColor: "var(--c-green-deep)",
            color: "color-mix(in srgb, var(--c-beige) 45%, transparent)",
            marginInline: "calc(var(--s-6) * -1)",
            paddingInline: "var(--s-6)",
          }}
        >
          <span>© 2026 BARREL. All rights reserved.</span>
          <span>本サイトの記事・画像の無断転載・無断使用を禁止します。</span>
        </div>
      </div>
    </footer>
  );
}
