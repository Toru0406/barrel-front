import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

/**
 * パンくずリスト + BreadcrumbList JSON-LD。
 * items の最後の要素は現在ページ（href なし、aria-current）。
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getabarrel.com";

export default function Breadcrumbs({ items }: Props) {
  // schema.org の item は絶対URL
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="パンくずリスト" className="py-s-2">
        <ol
          className="flex flex-wrap items-center gap-1"
          style={{ fontFamily: "var(--f-mono)", fontSize: "var(--t-xs)", color: "var(--c-ink-muted)" }}
        >
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" style={{ color: "var(--c-line)" }}>
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-opacity hover:opacity-70"
                  style={{ color: "var(--c-ink-muted)" }}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" style={{ color: "var(--c-ink)" }}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
