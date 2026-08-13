import Link from "next/link";
import Image from "next/image";
import { getNav } from "@/lib/nav";

export default async function Footer() {
  const columns = await getNav();

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

        {/* Category columns（WPカテゴリから生成） */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {columns.map((col) => (
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
