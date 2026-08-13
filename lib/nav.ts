// CMS（cms.getabarrel.com / barrel-theme）のヘッダー・フッターに完全一致させた固定ナビ。
// CMS側もキュレーション済みの固定メニューのため、WPカテゴリ動的生成ではなくここで定義する。
export interface NavItem {
  label: string;
  href: string;
}

// デスクトップ・プライマリナビ（CMS: 指導・育成 / コンディショニング / チーム運営 / about）
export const PRIMARY_NAV: NavItem[] = [
  { label: "指導・育成", href: "/category/coaching" },
  { label: "コンディショニング", href: "/category/conditioning" },
  { label: "チーム運営", href: "/category/management" },
  { label: "about", href: "/about" },
];

// モバイルメニュー（CMS: 上記＋トレーニング・競技別）
export const MOBILE_NAV: NavItem[] = [
  { label: "指導・育成", href: "/category/coaching" },
  { label: "コンディショニング", href: "/category/conditioning" },
  { label: "チーム運営", href: "/category/management" },
  { label: "トレーニング", href: "/category/training" },
  { label: "競技別", href: "/category/sports" },
  { label: "about", href: "/about" },
];

// フッター「カテゴリ」列
export const FOOTER_CATEGORIES: NavItem[] = [
  { label: "指導・育成", href: "/category/coaching" },
  { label: "コンディショニング", href: "/category/conditioning" },
  { label: "チーム運営", href: "/category/management" },
  { label: "トレーニング", href: "/category/training" },
  { label: "競技別", href: "/category/sports" },
];

// フッター「サイト」列
export const FOOTER_SITE: NavItem[] = [
  { label: "about", href: "/about" },
  { label: "お問い合わせ", href: "/contact" },
];

// SNSリンク（CMSと同一）
export const SOCIAL_LINKS: { label: string; href: string; path: string }[] = [
  {
    label: "Twitter（X）",
    href: "https://twitter.com/getabarrel",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "note",
    href: "https://note.com/barrel",
    path: "M11.99 2C6.477 2 2 6.477 2 11.99s4.477 9.99 9.99 9.99 9.99-4.477 9.99-9.99S17.503 2 11.99 2zm0 17.98c-4.406 0-7.98-3.574-7.98-7.98S7.584 4.02 11.99 4.02s7.98 3.574 7.98 7.98-3.574 7.98-7.98 7.98zm-.01-6.99c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm1-7.5h-2v5.5h2V5.49z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/getabarrel",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
];
