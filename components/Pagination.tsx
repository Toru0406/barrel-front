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
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
        >
          前へ
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={`${basePath}?page=${p}`}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            p === currentPage
              ? "bg-gray-900 text-white"
              : "border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
