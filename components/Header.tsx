import Link from "next/link";
import { getCategories } from "@/lib/wordpress";

export default async function Header() {
  const categories = await getCategories();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors">
          Barrel
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            記事一覧
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
