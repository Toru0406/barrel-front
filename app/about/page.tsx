import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BARRELについて / 編集方針",
  description:
    "BARRELの運営方針、出典の考え方、広告表記、訂正方針について説明します。",
};

const sections: { title: string; body: string }[] = [
  {
    title: "ミッション",
    body: "研究に基づく知見を現場の行動に翻訳する。BARRELは、スポーツ科学の知見を実際の練習・生活に活かせるかたちで届けることを目的とした編集メディアです。速報や話題性より、根拠の確かさと実用性を優先します。",
  },
  {
    title: "出典の方針",
    body: "一次情報（査読済み論文・公的統計）および二次情報（学術機関・専門学会の公式見解）のみを根拠として使用します。参考文献のリンクは記事末に明記します。出典が確認できない情報は掲載しません。",
  },
  {
    title: "広告・PR表記の方針",
    body: "アフィリエイト広告を含む記事は、記事冒頭に「本記事はアフィリエイト広告を含みます」と明記します。掲載順序や評価は広告報酬によって決定しません。記事の内容と広告主の意向は独立しています。Amazonのアソシエイトとして、BARRELは適格販売により収入を得ています。",
  },
  {
    title: "訂正の方針",
    body: "誤りが判明した場合は、記事内の該当箇所に訂正日と訂正内容を明記します。削除ではなく透明性のある訂正を原則とします。",
  },
  {
    title: "制作プロセスとAIの利用",
    body: "記事の下書きは、収集した一次・二次情報をもとにAI（大規模言語モデル）が作成し、数値・引用・法令表現を機械検査と編集部の確認を経て公開しています。実在しない執筆者名や経歴は使いません。著者表記は「BARREL編集部」とし、専門家が監修した記事にはその方の実名と資格を明記します。",
  },
  {
    title: "運営者",
    body: "BARREL編集部。ご連絡はSNS（X）よりお願いいたします。",
  },
  {
    title: "利用上の注意",
    body: "BARRELの情報は教育・参考目的です。医療上の判断や治療方針の決定には、必ず医師など専門家にご相談ください。",
  },
];

export default function AboutPage() {
  return (
    <div
      className="max-w-[720px] mx-auto px-6 py-16"
      style={{ color: "var(--c-ink, #14201A)" }}
    >
      <header className="mb-12">
        <h1
          className="font-serif text-3xl font-bold mb-2 leading-tight"
          style={{ color: "var(--c-ink, #14201A)" }}
        >
          BARRELについて
        </h1>
        <p
          className="text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-oswald, ui-sans-serif)",
            fontWeight: 500,
            color: "var(--c-ink-muted, #5F6B64)",
            letterSpacing: "0.12em",
          }}
        >
          編集方針
        </p>
      </header>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2
              className="font-sans text-sm font-bold mb-3 pb-2 border-b"
              style={{
                color: "var(--c-ink, #14201A)",
                borderColor: "var(--c-line, #D9D7CE)",
              }}
            >
              {s.title}
            </h2>
            <p
              className="font-sans text-sm leading-loose"
              style={{ color: "var(--c-ink, #14201A)" }}
            >
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
