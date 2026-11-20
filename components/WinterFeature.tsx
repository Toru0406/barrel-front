import Link from "next/link";
import { getPostBySlug, isSponsored, type WPPost } from "@/lib/wordpress";
import SectionHeading from "@/components/SectionHeading";
import PrBadge from "@/components/PrBadge";
import { FEATURE_COPY, FEATURE_GROUPS, featurePhase } from "@/lib/winterFeature";

/**
 * トップページの特集枠（2026-11-19 追加）。設定と日付の判定は lib/winterFeature.ts。
 *
 * ・大会期間（日本時間 11/19〜24）は「神宮大会期間特集」、11/25 以降は「冬の体づくり特集」と、見出しと注記だけが切り替わる。
 *   リンク集は共通。切り替えに人の作業や追加のPRは要らない（トップは revalidate=300 なので、日付が変わってから最大5分で反映）
 * ・記事は表示のたびにトップページと同じ getPostBySlug で引き直し、公開されていない記事は出さない。
 *   グループの記事が全部取れなければそのグループごと出さず、全体が空なら枠を出さない
 * ・見た目は既存の部品（SectionHeading・PrBadge）と「テーマから探す」の記事リストの組み方に合わせ、新しい装飾は足さない
 */
export default async function WinterFeature({ now = new Date() }: { now?: Date }) {
  const phase = featurePhase(now);
  if (phase === "before") return null;
  const copy = FEATURE_COPY[phase];

  const groups = (
    await Promise.all(
      FEATURE_GROUPS.map(async (g) => ({
        label: g.label,
        posts: (await Promise.all(g.slugs.map((s) => getPostBySlug(s).catch(() => null)))).filter(
          (p): p is WPPost => p !== null
        ),
      }))
    )
  ).filter((g) => g.posts.length > 0);
  if (groups.length === 0) return null;
  return <WinterFeatureView copy={copy} groups={groups} />;
}

/** 描画だけを受け持つ（記事の取得はしない）。取得と分けて、見た目を単独で確かめられるようにしている */
export function WinterFeatureView({
  copy,
  groups,
}: {
  copy: { title: string; note: string };
  groups: Array<{ label: string; posts: WPPost[] }>;
}) {
  return (
    <section aria-label={copy.title} style={{ borderBottom: "1px solid var(--c-line)" }}>
      <div className="mx-auto px-4 py-s-7" style={{ maxWidth: 1240 }}>
        <SectionHeading title={copy.title} />
        <p
          className="-mt-s-3 mb-s-5"
          style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sm)", color: "var(--c-ink-muted)", lineHeight: 1.7 }}
        >
          {copy.note}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-s-6 gap-y-s-5">
          {groups.map(({ label, posts }) => (
            <div key={label}>
              <h3
                className="mb-s-2"
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-base)",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: "var(--c-ink)",
                }}
              >
                {label}
              </h3>
              <ul>
                {posts.map((post) => (
                  <li key={post.id} style={{ borderBottom: "1px solid var(--c-line)" }}>
                    <Link
                      href={`/articles/${post.slug}`}
                      className="block py-s-3 min-h-[44px] transition-opacity hover:opacity-75"
                      style={{
                        fontFamily: "var(--f-body)",
                        fontSize: "var(--t-sm)",
                        color: "var(--c-ink)",
                        lineHeight: 1.5,
                      }}
                    >
                      <span className="line-clamp-3 block" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      {isSponsored(post) && <PrBadge sponsored className="mt-1 inline-block" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
