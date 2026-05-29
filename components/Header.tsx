"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "コンディショニング", href: "/category/conditioning" },
  {
    label: "チーム運営",
    href: "/category/management",
    children: [
      { label: "チームビルディング", href: "/category/チームビルディング" },
      { label: "リーダーシップ",     href: "/category/リーダーシップ" },
      { label: "運営費・資金",       href: "/category/運営費・資金" },
    ],
  },
  { label: "トレーニング", href: "/category/training" },
  { label: "指導・育成",   href: "/category/coaching" },
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
  { label: "道具", href: "/category/gear" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-barrel-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/logo/barrel-logo.png"
            alt="BARREL"
            width={200}
            height={44}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-0.5 px-3 py-2 font-sans text-sm text-barrel-black hover:text-barrel-green transition-colors duration-150"
                >
                  {item.label}
                  <ChevronDown
                    size={13}
                    className="mt-0.5 transition-transform duration-200 group-hover:rotate-180"
                  />
                </Link>
                {/* Dropdown */}
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block min-w-[11rem]">
                  <ul className="bg-white border border-barrel-gray-200 rounded shadow-lg py-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2 font-sans text-sm text-barrel-black hover:bg-barrel-green hover:text-white transition-colors"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 font-sans text-sm text-barrel-black hover:text-barrel-green transition-colors duration-150"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-barrel-black p-2"
          aria-label="メニューを開く"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-barrel-gray-200">
          {NAV_ITEMS.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <>
                  <button
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === item.href ? null : item.href
                      )
                    }
                    className="w-full flex items-center justify-between px-6 py-4 font-sans text-sm text-barrel-black hover:text-barrel-green hover:bg-barrel-gray-100 border-b border-barrel-gray-200 transition-colors"
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        mobileExpanded === item.href ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileExpanded === item.href &&
                    item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block pl-10 pr-6 py-3 font-sans text-sm text-barrel-gray-600 hover:text-barrel-green hover:bg-barrel-gray-100 border-b border-barrel-gray-200 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-6 py-4 font-sans text-sm text-barrel-black hover:text-barrel-green hover:bg-barrel-gray-100 border-b border-barrel-gray-200 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
