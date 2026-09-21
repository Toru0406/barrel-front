/** @type {import('next').NextConfig} */
const nextConfig = {
  // 旧URL /blog/<slug> は /articles/<slug> に統一（重複コンテンツ解消）。ページ内で redirect() すると
  // 静的生成時に meta refresh の 200 になるため、ルーティング層で 308 を返す
  async redirects() {
    return [
      { source: "/blog/:slug", destination: "/articles/:slug", permanent: true },
      // 規約系ページは記事として持たず静的ページに分離した。先に既存URLで公開しているため寄せる
      { source: "/articles/data-deletion", destination: "/legal/data-deletion", permanent: true },
      // WordPress時代のパーマリンクは /<slug>/ だった。移行後そのURLは 404 になっていたので
      // /articles/<slug> へ寄せる。redirects は public/ の静的ファイルより先に評価されるため、
      // ドットを含むパス（Search Console の検証HTML・IndexNow のキーtxt）と既存の
      // トップレベルルートは必ず除外する
      {
        source:
          "/:slug((?!api|_next|articles|hub|blog|about|legal|search|category|feed|sitemap|robots|icon|apple-icon|favicon|images|logo)[^/.]+)",
        destination: "/articles/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "getabarrel.com" },
      { protocol: "https", hostname: "www.getabarrel.com" },
      { protocol: "https", hostname: "cms.getabarrel.com" },
    ],
  },
};

export default nextConfig;
