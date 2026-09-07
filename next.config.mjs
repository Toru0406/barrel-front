/** @type {import('next').NextConfig} */
const nextConfig = {
  // 旧URL /blog/<slug> は /articles/<slug> に統一（重複コンテンツ解消）。ページ内で redirect() すると
  // 静的生成時に meta refresh の 200 になるため、ルーティング層で 308 を返す
  async redirects() {
    return [{ source: "/blog/:slug", destination: "/articles/:slug", permanent: true }];
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
