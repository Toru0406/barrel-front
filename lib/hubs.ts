/**
 * サイトのハブ（読者向けテーマ別セクション）定義。
 *
 * どのハブの wpCategoryIds にも入っていないカテゴリの記事は、ハブページにもサイトマップ経由の
 * 導線にも現れず、/blog?page=2 からしか辿れなくなる。2026-09-20 時点でメンタル(20)と
 * チームビルディング(10)の3本がその状態で、いずれも Google 未登録だった。
 * カテゴリを増やしたら必ずどれかのハブに割り当てること。
 *
 * WP カテゴリ ID は 2026-09-07 に以下のエンドポイントで確認済み:
 *   curl https://cms.getabarrel.com/wp-json/wp/v2/categories?per_page=100&_fields=id,slug,name,count
 * 結果（抜粋）:
 *   id:3  slug:coaching    指導・育成
 *   id:4  slug:training    トレーニング
 *   id:5  slug:conditioning コンディショニング
 *   id:6  slug:management  チーム運営
 *   id:13 slug:gear        道具
 *   id:21 slug:gear-gear   ギア（設計書の 21 は "gear-gear"、"gear" スラッグは id:13）
 *   id:22 slug:books       書籍
 *   id:23 slug:supplement  サプリ
 *
 * 設計書の gear-supplement の wpCategoryIds が [21,23,22] だったが、
 * slug:"gear" の実 ID は 13。21 は "gear-gear"（別カテゴリ）のため [13,23,22] に修正。
 */

export interface Hub {
  id: string;
  label: string;
  /** ヘッダーナビ用の短縮ラベル（1行に収めるため） */
  short: string;
  tagline: string;
  categorySlugs: string[];
  wpCategoryIds: number[];
}

export const HUBS: Hub[] = [
  {
    id: "coaching-practice",
    label: "練習設計と指導",
    short: "練習・指導",
    tagline: "科学的根拠に基づく練習メニューと指導法を、現場で使える形で届ける。",
    categorySlugs: ["coaching", "mental"],
    wpCategoryIds: [3, 20], // 20=メンタル。指導者向けの内容なのでこのハブに寄せる
  },
  {
    id: "growth-body",
    label: "成長期の身体づくり",
    short: "身体づくり",
    tagline: "ジュニア・ユース期の身体発育と、正しいトレーニング負荷の考え方を解説する。",
    categorySlugs: ["training"],
    wpCategoryIds: [4],
  },
  {
    id: "injury-conditioning",
    label: "障害予防とコンディショニング",
    short: "障害予防",
    tagline: "怪我を防ぎ、競技パフォーマンスを安定させるコンディション管理の実践知識。",
    categorySlugs: ["conditioning"],
    wpCategoryIds: [5],
  },
  {
    id: "team-parents",
    label: "チーム運営と保護者",
    short: "運営・保護者",
    tagline: "チームを円滑に動かす運営術と、保護者が選手をサポートするための情報。",
    categorySlugs: [
      "management",
      "%e3%83%81%e3%83%bc%e3%83%a0%e3%83%93%e3%83%ab%e3%83%87%e3%82%a3%e3%83%b3%e3%82%b0", // チームビルディング（WPは日本語スラッグをパーセントエンコードで保持する）
    ],
    wpCategoryIds: [6, 10], // 10=チームビルディング
  },
  {
    id: "gear-supplement",
    label: "道具・サプリの選び方",
    short: "道具・サプリ",
    tagline: "エビデンスに基づいたギア・サプリメント・書籍の選び方と使い方。",
    categorySlugs: ["gear", "gear-gear", "supplement", "books", "service", "ticket"],
    wpCategoryIds: [13, 21, 23, 22], // 13=道具(親) 21=ギア(子) 23=サプリ 22=書籍。親子を両方指定して取りこぼしを防ぐ
  },
];

/** カテゴリスラッグからハブを返す。見つからなければ null。 */
export function hubForCategorySlug(slug: string): Hub | null {
  return HUBS.find((h) => h.categorySlugs.includes(slug)) ?? null;
}

/** ハブ ID からハブを返す。見つからなければ null。 */
export function hubById(id: string): Hub | null {
  return HUBS.find((h) => h.id === id) ?? null;
}
