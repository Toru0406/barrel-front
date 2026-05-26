"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "指導・育成", href: "/category/coaching" },
  { label: "コンディショニング", href: "/category/conditioning" },
  { label: "チーム運営", href: "/category/management" },
  { label: "トレーニング", href: "/category/training" },
  { label: "競技別", href: "/category/sports" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#0A0A0A] border-b border-[#222222] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-[#E8D5B0] tracking-widest"
        >
          BARREL
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white hover:text-[#E8D5B0] transition-colors duration-200 tracking-wide"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2"
          aria-label="メニューを開く"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#111111] border-t border-[#222222]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-4 text-sm text-white hover:text-[#E8D5B0] hover:bg-[#0D3320] transition-colors border-b border-[#222222]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
