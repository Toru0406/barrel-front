/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "getabarrel.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.getabarrel.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "150.95.255.38",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/wp/:path*",
        destination: "https://150.95.255.38/wp-json/wp/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
