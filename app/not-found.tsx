import Link from "next/link";
import { HUBS } from "@/lib/hubs";
import Eyebrow from "@/components/Eyebrow";

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: "var(--c-paper)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* エラーヘッダー */}
      <div
        className="line-band flex-shrink-0"
        style={{ paddingBlock: "var(--s-7)" }}
      >
        <div className="mx-auto px-4 text-center" style={{ maxWidth: 1240 }}>
          <p
            aria-label="404"
            style={{
              fontFamily: "var(--f-utility)",
              fontSize: "clamp(80px,12vw,160px)",
              fontWeight: 500,
              color: "rgba(232,213,176,0.15)",
              lineHeight: 1,
              userSelect: "none",
              letterSpacing: "0.05em",
            }}
          >
            404
          </p>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-2xl)",
              fontWeight: 700,
              color: "var(--c-beige)",
              letterSpacing: "0.02em",
              marginTop: "var(--s-4)",
            }}
          >
            ページが見つかりませんでした
          </h1>
          <p
            className="mt-s-3"
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sm)",
              color: "rgba(232,213,176,0.7)",
              lineHeight: 1.7,
            }}
          >
            URLが間違っているか、記事が移動・削除された可能性があります。
          </p>
          <div className="flex flex-wrap justify-center gap-s-3 mt-s-6">
            <Link href="/" className="btn-cta">
              トップへ戻る
            </Link>
          </div>
        </div>
      </div>

      {/* ハブ一覧 */}
      <div
        className="mx-auto px-4 py-s-7 flex-1 w-full"
        style={{ maxWidth: 1240 }}
      >
        <div className="mb-s-6">
          <Eyebrow className="mb-s-2">TOPIC</Eyebrow>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-xl)",
              fontWeight: 700,
              color: "var(--c-ink)",
              letterSpacing: "0.02em",
            }}
          >
            テーマから探す
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-s-4">
          {HUBS.map((hub) => (
            <Link
              key={hub.id}
              href={`/hub/${hub.id}`}
              className="block transition-opacity hover:opacity-75"
              style={{
                borderTop: "3px solid var(--c-green)",
                paddingTop: "var(--s-3)",
              }}
            >
              <h3
                className="mb-s-1"
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-base)",
                  fontWeight: 700,
                  color: "var(--c-ink)",
                  letterSpacing: "0.02em",
                }}
              >
                {hub.label}
              </h3>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-xs)",
                  color: "var(--c-ink-muted)",
                  lineHeight: 1.6,
                }}
              >
                {hub.tagline}
              </p>
            </Link>
          ))}
        </div>

        {/* 記事一覧リンク */}
        <div
          className="mt-s-7 text-center"
          style={{ borderTop: "1px solid var(--c-line)", paddingTop: "var(--s-5)" }}
        >
          <Link
            href="/blog"
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sm)",
              color: "var(--c-ink-muted)",
              borderBottom: "1px solid var(--c-line)",
            }}
            className="transition-opacity hover:opacity-70"
          >
            記事一覧をすべて見る
          </Link>
        </div>
      </div>
    </div>
  );
}
