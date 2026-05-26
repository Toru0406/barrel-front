import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: { default: "Barrel", template: "%s | Barrel" },
  description: "Barrelのオフィシャルブログ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} bg-gray-50 text-gray-900`}>
        <Header />
        <main>{children}</main>
        <footer className="mt-20 border-t border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Barrel Inc.
          </div>
        </footer>
      </body>
    </html>
  );
}
