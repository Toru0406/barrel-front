// LINE公式アカウントの友だち追加CTA。Footer と同じダークグリーン／ベージュ配色。
// NEXT_PUBLIC_LINE_ADD_URL が未設定のときは何も描画しない。
const LINE_ADD_URL = process.env.NEXT_PUBLIC_LINE_ADD_URL;

interface Props {
  className?: string;
}

export default function LineCta({ className = "" }: Props) {
  if (!LINE_ADD_URL) return null;

  return (
    <aside
      aria-labelledby="line-cta-title"
      className={`bg-[#112814] px-6 py-10 text-barrel-beige md:px-10 ${className}`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-barrel-beige/50">
            LINE
          </p>
          <h2
            id="line-cta-title"
            className="font-serif text-xl font-bold leading-snug md:text-2xl"
          >
            LINEで新着記事を受け取る
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-barrel-beige/60">
            BARRELの新着記事をLINEでお届けします。友だち追加は無料です。
          </p>
        </div>
        <a
          href={LINE_ADD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block shrink-0 whitespace-nowrap bg-barrel-beige px-8 py-4 font-sans text-sm font-bold tracking-wider text-barrel-green transition-colors hover:bg-white"
        >
          友だち追加する
        </a>
      </div>
    </aside>
  );
}
