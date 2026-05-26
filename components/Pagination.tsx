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
          className="px-4 py-2 border border-[#E5E5E5] text-sm text-[#1A1A1A] hover:border-[#0D3320] hover:text-[#0D3320] transition-colors"
        >
          前へ
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={`${basePath}?page=${p}`}
          className={`px-4 py-2 text-sm transition-colors ${
            p === currentPage
              ? "bg-[#0D3320] text-white"
              : "border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#0D3320] hover:text-[#0D3320]"
          }`}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-4 py-2 border border-[#E5E5E5] text-sm text-[#1A1A1A] hover:border-[#0D3320] hover:text-[#0D3320] transition-colors"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
