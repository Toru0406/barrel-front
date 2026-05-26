/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "getabarrel.com" },
      { protocol: "https", hostname: "www.getabarrel.com" },
      { protocol: "http", hostname: "150.95.255.38" },
      { protocol: "https", hostname: "150.95.255.38" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/wp/:path*",
        destination: "http://150.95.255.38/wp-json/wp/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
