import QRCode from "qrcode";

/**
 * LINE 購読 CTA 帯。NEXT_PUBLIC_LINE_ADD_URL 未設定時は何も描画しない。
 *
 * PC のブラウザで lin.ee / line.me の友だち追加URLを開くと、LINE 側が「LINEアプリを開く」ボタン付きの
 * 中継ページを出すが、これは LINE for PC が入っていて protocol handler が許可された環境でしか遷移しない
 * （仕様上、PC から直接友だち追加はできない）。そのため PC には自前の QR コードを見せ、
 * スマホにはリンクをそのまま踏ませる。QR はビルド時/リクエスト時にサーバー側で SVG 生成する（外部通信なし）。
 */
export default async function LineCta() {
  const lineUrl = process.env.NEXT_PUBLIC_LINE_ADD_URL;
  if (!lineUrl) return null;

  let qrSvg = "";
  try {
    qrSvg = await QRCode.toString(lineUrl, { type: "svg", margin: 1, width: 160, color: { dark: "#14201A", light: "#F8F7F3" } });
  } catch {
    qrSvg = ""; // QR 生成に失敗してもボタンは出す
  }

  return (
    <section
      className="py-s-7 px-s-4"
      style={{ backgroundColor: "var(--c-paper-2)" }}
      aria-label="LINE 登録案内"
    >
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-s-5 md:flex-row md:justify-center md:gap-s-7">
        <div className="text-center md:text-left">
          <h2
            className="mb-s-3"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-2xl)",
              fontWeight: 700,
              lineHeight: 1.35,
              letterSpacing: "0.02em",
              fontFeatureSettings: '"palt" 1',
              color: "var(--c-ink)",
            }}
          >
            新着記事と研究の要点をLINEで
          </h2>
          <p
            className="mb-s-4"
            style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sm)", color: "var(--c-ink-muted)", lineHeight: 1.7 }}
          >
            週1回、指導と身体づくりに使える要点だけを届けます。
            <span className="hidden md:inline">PCの方はQRコードをスマホのLINEで読み取ってください。</span>
          </p>
          {/* スマホでは同じタブで遷移させる（別タブだと iOS でアプリ連携が切れることがある） */}
          <a href={lineUrl} rel="noopener" className="btn-cta md:hidden">
            LINE で受け取る（無料）
          </a>
          <a href={lineUrl} rel="noopener" target="_blank" className="btn-cta hidden md:inline-block">
            LINE で受け取る（無料）
          </a>
        </div>
        {qrSvg && (
          <figure className="hidden md:block" aria-label="LINE 友だち追加 QR コード">
            <div
              className="rounded-[var(--r-1)] border"
              style={{ borderColor: "var(--c-line)", width: 160, height: 160, backgroundColor: "var(--c-paper)" }}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <figcaption
              className="mt-s-2 text-center"
              style={{ fontFamily: "var(--f-mono)", fontSize: "var(--t-xs)", color: "var(--c-ink-muted)" }}
            >
              スマホで読み取り
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
