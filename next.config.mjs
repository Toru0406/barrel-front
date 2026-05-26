/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "getabarrel.com" },
      { protocol: "https", hostname: "www.getabarrel.com" },
      { protocol: "https", hostname: "178.105.13.166" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/wp/:path*",
        destination: "https://178.105.13.166/wp-json/wp/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
