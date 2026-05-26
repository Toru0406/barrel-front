import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-4 py-2 font-sans text-sm border border-barrel-gray-200 text-barrel-black hover:border-barrel-green hover:text-barrel-green transition-colors"
        >
          前へ
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={`${basePath}?page=${p}`}
          className={`px-4 py-2 font-sans text-sm transition-colors ${
            p === currentPage
              ? "bg-barrel-green text-white"
              : "border border-barrel-gray-200 text-barrel-black hover:border-barrel-green hover:text-barrel-green"
          }`}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-4 py-2 font-sans text-sm border border-barrel-gray-200 text-barrel-black hover:border-barrel-green hover:text-barrel-green transition-colors"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
