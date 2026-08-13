import { getCategories, type WPCategory } from "./wordpress";

export interface NavNode {
  label: string;
  href: string;
  children: { label: string; href: string }[];
}

// WP REST にはカテゴリの並び順が無いため、トップレベルのIA順だけここで固定する。
// ここに無いスラッグは name 昇順で末尾に自動追加される（WPでカテゴリを増やせば自動で出る）。
const TOP_ORDER = ["conditioning", "management", "training", "coaching", "sports", "gear"];
// ナビに出さないカテゴリ
const EXCLUDE_SLUGS = new Set(["home", "uncategorized"]);

// WPの日本語スラッグは%エンコード済み文字列。デコードして Link 側に正しく再エンコードさせる。
function href(cat: WPCategory): string {
  return `/category/${decodeURIComponent(cat.slug)}`;
}

/** WPカテゴリの親子構造からヘッダー/フッター共通のナビツリーを生成する */
export async function getNav(): Promise<NavNode[]> {
  const cats = (await getCategories({ hideEmpty: false })).filter(
    (c) => !EXCLUDE_SLUGS.has(c.slug)
  );

  const byParent = new Map<number, WPCategory[]>();
  for (const c of cats) {
    const arr = byParent.get(c.parent) ?? [];
    arr.push(c);
    byParent.set(c.parent, arr);
  }

  const tops = (byParent.get(0) ?? []).sort((a, b) => {
    const ia = TOP_ORDER.indexOf(a.slug);
    const ib = TOP_ORDER.indexOf(b.slug);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.name.localeCompare(b.name, "ja");
  });

  return tops.map((top) => ({
    label: top.name,
    href: href(top),
    children: (byParent.get(top.id) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name, "ja"))
      .map((c) => ({ label: c.name, href: href(c) })),
  }));
}
