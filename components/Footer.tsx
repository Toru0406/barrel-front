import Link from "next/link";

const CAT_LINKS = [
  { label: "指導・育成", href: "/category/coaching" },
  { label: "コンディショニング", href: "/category/conditioning" },
  { label: "チーム運営", href: "/category/management" },
  { label: "トレーニング", href: "/category/training" },
  { label: "競技別", href: "/category/sports" },
];

const SNS_LINKS = [
  { label: "Twitter", href: "https://twitter.com/getabarrel" },
  { label: "note", href: "https://note.com/barrel" },
  { label: "Instagram", href: "https://www.instagram.com/getabarrel" },
];

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#222222]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div>
            <p className="font-serif text-xl font-bold text-[#E8D5B0] tracking-widest mb-3">
              BARREL
            </p>
            <p className="text-sm text-[#999999]">すべての競技人に、科学の知見を。</p>
          </div>

          <div>
            <p className="text-xs text-[#999999] tracking-widest uppercase mb-4">Categories</p>
            <ul className="space-y-2.5">
              {CAT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#999999] hover:text-[#E8D5B0] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs text-[#999999] tracking-widest uppercase mb-4">Follow</p>
            <ul className="space-y-2.5">
              {SNS_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#999999] hover:text-[#E8D5B0] transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#222222] text-center text-xs text-[#999999]">
          © 2026 BARREL
        </div>
      </div>
    </footer>
  );
}
