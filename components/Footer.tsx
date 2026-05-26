import Link from "next/link";
import Image from "next/image";

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
    <footer className="bg-barrel-black">
      <div className="px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div>
            <Link href="/">
              <Image
                src="/logo/barrel-logo.png"
                alt="BARREL"
                width={200}
                height={44}
                className="h-9 w-auto object-contain [filter:brightness(0)_invert(1)]"
              />
            </Link>
            <p className="mt-3 font-sans text-sm text-barrel-gray-400 leading-relaxed">
              すべての競技人に、科学の知見を。
            </p>
          </div>

          <div>
            <p className="font-sans text-xs text-barrel-gray-600 tracking-widest uppercase mb-4">
              Categories
            </p>
            <ul className="space-y-2.5">
              {CAT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-barrel-gray-400 hover:text-barrel-beige transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sans text-xs text-barrel-gray-600 tracking-widest uppercase mb-4">
              Follow
            </p>
            <ul className="space-y-2.5">
              {SNS_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-barrel-gray-400 hover:text-barrel-beige transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-barrel-gray-800 text-center font-sans text-xs text-barrel-gray-600">
          © 2026 BARREL
        </div>
      </div>
    </footer>
  );
}
