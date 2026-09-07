import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  /** ベースパス（例: "/blog"）。page パラメータ以外のクエリは queryParams で渡す。 */
  basePath: string;
  /** page 以外の追加クエリパラメータ（例: { q: "検索ワード" }）。 */
  queryParams?: Record<string, string>;
}

/** ウィンドウ付きページ番号生成: first / … / current±2 / … / last */
function getWindowedPages(current: number, total: number): (number | "…")[] {
  if (total <= 1) return [];
  const delta = 2;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const pages: (number | "…")[] = [1];
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  if (total > 1) pages.push(total);
  return pages;
}

const base =
  "inline-flex items-center justify-center min-w-[36px] h-9 px-2 text-sm transition-colors";
const inactive = "hover:opacity-70";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = getWindowedPages(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  function buildHref(page: number): string {
    const qs = new URLSearchParams({ ...queryParams, page: String(page) });
    return `${basePath}?${qs.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-center gap-1 py-s-6"
      aria-label="ページナビゲーション"
      style={{ fontFamily: "var(--f-mono)", fontSize: "var(--t-xs)" }}
    >
      {/* 前へ */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          aria-label="前のページ"
          className={`${base} ${inactive} border`}
          style={{ borderColor: "var(--c-line)", color: "var(--c-ink-muted)" }}
        >
          ‹
        </Link>
      ) : (
        <span
          className={`${base} border cursor-not-allowed opacity-30`}
          style={{ borderColor: "var(--c-line)", color: "var(--c-ink-muted)" }}
          aria-hidden="true"
        >
          ‹
        </span>
      )}

      {/* ページ番号 */}
      {pages.map((page, i) =>
        page === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className={`${base} opacity-50`}
            style={{ color: "var(--c-ink-muted)" }}
            aria-hidden="true"
          >
            …
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className={`${base} font-bold pointer-events-none`}
            style={{
              backgroundColor: "var(--c-green)",
              color: "var(--c-beige)",
            }}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            aria-label={`${page}ページへ`}
            className={`${base} ${inactive} border`}
            style={{ borderColor: "var(--c-line)", color: "var(--c-ink-muted)" }}
          >
            {page}
          </Link>
        )
      )}

      {/* 次へ */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          aria-label="次のページ"
          className={`${base} ${inactive} border`}
          style={{ borderColor: "var(--c-line)", color: "var(--c-ink-muted)" }}
        >
          ›
        </Link>
      ) : (
        <span
          className={`${base} border cursor-not-allowed opacity-30`}
          style={{ borderColor: "var(--c-line)", color: "var(--c-ink-muted)" }}
          aria-hidden="true"
        >
          ›
        </span>
      )}
    </nav>
  );
}
