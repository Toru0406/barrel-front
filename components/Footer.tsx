import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    label: "コンディショニング",
    href: "/category/conditioning",
    children: [],
  },
  {
    label: "チーム運営",
    href: "/category/management",
    children: [
      { label: "チームビルディング", href: "/category/チームビルディング" },
      { label: "リーダーシップ",     href: "/category/リーダーシップ" },
      { label: "運営費・資金",       href: "/category/運営費・資金" },
    ],
  },
  {
    label: "トレーニング",
    href: "/category/training",
    children: [],
  },
  {
    label: "指導・育成",
    href: "/category/coaching",
    children: [],
  },
  {
    label: "競技別",
    href: "/category/sports",
    children: [
      { label: "アメリカンフットボール", href: "/category/アメフト" },
      { label: "ラグビー",               href: "/category/rugby" },
      { label: "バレーボール",           href: "/category/volleyball" },
      { label: "バスケットボール",       href: "/category/basketball" },
      { label: "サッカー",               href: "/category/soccer" },
      { label: "野球",                   href: "/category/baseball" },
    ],
  },
  {
    label: "道具",
    href: "/category/gear",
    children: [],
  },
];

export default function Footer() {
  return (
    <footer className="bg-barrel-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/">
            <Image
              src="/logo/barrel-logo-footer.png"
              alt="BARREL"
              width={320}
              height={72}
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Category columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {COLUMNS.map((col) => (
            <div key={col.href}>
              <Link
                href={col.href}
                className="block font-sans text-sm font-bold text-white hover:text-barrel-beige transition-colors mb-3"
              >
                {col.label}
              </Link>
              {col.children.length > 0 && (
                <ul className="space-y-2">
                  {col.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="font-sans text-xs text-barrel-gray-400 hover:text-barrel-beige transition-colors"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-barrel-gray-800 pt-8 text-center font-sans text-xs text-barrel-gray-600">
          © 2025 BARREL All rights reserved.
        </div>
      </div>
    </footer>
  );
}
