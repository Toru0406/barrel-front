import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { getNav } from "@/lib/nav";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const nav = await getNav();

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

        {/* Desktop Nav（ドロップダウンはCSSのgroup-hoverのみ＝JS不要） */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) =>
            item.children.length > 0 ? (
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

        {/* Mobile hamburger + menu（clientコンポーネント） */}
        <MobileMenu items={nav} />
      </div>
    </header>
  );
}
