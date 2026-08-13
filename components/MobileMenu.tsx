"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import type { NavNode } from "@/lib/nav";

export default function MobileMenu({ items }: { items: NavNode[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden text-barrel-black p-2"
        aria-label="メニューを開く"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white border-t border-barrel-gray-200 shadow-sm">
          {items.map((item) => (
            <div key={item.href}>
              {item.children.length > 0 ? (
                <>
                  <button
                    onClick={() =>
                      setExpanded(expanded === item.href ? null : item.href)
                    }
                    className="w-full flex items-center justify-between px-6 py-4 font-sans text-sm text-barrel-black hover:text-barrel-green hover:bg-barrel-gray-100 border-b border-barrel-gray-200 transition-colors"
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        expanded === item.href ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded === item.href &&
                    item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="block pl-10 pr-6 py-3 font-sans text-sm text-barrel-gray-600 hover:text-barrel-green hover:bg-barrel-gray-100 border-b border-barrel-gray-200 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-6 py-4 font-sans text-sm text-barrel-black hover:text-barrel-green hover:bg-barrel-gray-100 border-b border-barrel-gray-200 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
