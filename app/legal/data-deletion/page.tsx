import type { Metadata } from "next";

// Meta（Threads）の「データ削除のコールバックURL」に登録する規約系ページ。
// WordPress記事として持つと記事一覧・sitemap・カテゴリに混ざるため、静的ページとして分離した。
export const metadata: Metadata = {
  title: "データの削除について",
  description:
    "Threads連携アプリ「Barrel-Auto-Generator」が取得する情報、連携の解除方法、データの削除請求について説明します。",
  robots: { index: true, follow: true },
};

const CONTACT = "getabarrel@gmail.com";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "取得する情報",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>運営者本人のThreadsアカウントの投稿・返信、および表示回数などの統計</li>
        <li>第三者のアカウント情報や個人データの取得・保存は行いません</li>
        <li>取得した統計は、運営者が管理するGoogleスプレッドシート上にのみ保存されます</li>
      </ul>
    ),
  },
  {
    title: "連携の解除",
    body: (
      <>
        本アプリとThreadsアカウントの連携を解除する場合は、Threadsアプリの「設定 &gt; アカウント &gt;
        ウェブサイトの許可」から本アプリを削除してください。解除した時点で、本アプリからThreadsアカウントへのアクセスは行えなくなります。
      </>
    ),
  },
  {
    title: "データの削除請求",
    body: (
      <>
        連携解除にともなうデータの削除、その他データの取り扱いに関するお問い合わせは、
        <a
          href={`mailto:${CONTACT}`}
          className="underline underline-offset-2"
          style={{ color: "var(--c-ink, #14201A)" }}
        >
          {CONTACT}
        </a>{" "}
        までご連絡ください。内容を確認のうえ、3営業日以内に対応し、削除の完了をご連絡します。
      </>
    ),
  },
];

export default function DataDeletionPage() {
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
          データの削除について
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
          Data Deletion
        </p>
      </header>

      <p
        className="font-sans text-sm leading-loose mb-10"
        style={{ color: "var(--c-ink, #14201A)" }}
      >
        このアプリケーション「Barrel-Auto-Generator」は、BARREL（getabarrel.com）の運営者本人が、自身のThreadsアカウントへ記事の告知を投稿するために使用しているものです。第三者に提供しているサービスではありません。
      </p>

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
            <div
              className="font-sans text-sm leading-loose"
              style={{ color: "var(--c-ink, #14201A)" }}
            >
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
