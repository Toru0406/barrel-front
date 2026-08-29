import type { Metadata } from "next";
import Script from "next/script";
import {
  Noto_Sans_JP,
  Shippori_Mincho,
  Playfair_Display,
  Noto_Serif_JP,
  Oswald,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// GA4 測定ID（G-XXXX）。NEXT_PUBLIC_GA_ID を設定したときだけ計測タグを読み込む。
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});
const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-display",
});
// CMS(barrel-theme)のホーム用：本文セリフ＝Noto Serif JP、アクセント＝Oswald
const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif-jp",
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: { default: "BARREL", template: "%s | BARREL" },
  description: "すべての競技人のための、スポーツ科学メディア",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${shipporiMincho.variable} ${playfairDisplay.variable} ${notoSerifJP.variable} ${oswald.variable} font-sans bg-barrel-white`}
      >
        <Header />
        <main>{children}</main>
        <Footer />

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
