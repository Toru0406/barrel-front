import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Oswald } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/* 和文は OS 標準の角ゴシック（globals.css の --f-sans）。Webフォントは英字用の2書体だけ読み込む */

/* Utility (数字・eyebrow): Oswald — --font-utility */
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-utility",
  display: "swap",
});

/* Mono (日付・出典数): IBM Plex Mono — --font-mono */
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getabarrel.com"),
  // 「BARREL」は一般語で、同名の別ブランド（eスポーツのVARREL、バレルサウナ等）が検索結果を
  // 占めている。単語だけのタイトルでは何のサイトか判別できないので、識別子を足す
  title: { default: "BARREL｜研究に基づくスポーツ科学メディア", template: "%s | BARREL" },
  description: "研究に基づくスポーツ科学メディア。指導者・選手・保護者へ",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: "BARREL",
    locale: "ja_JP",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

/* Organization / WebSite 構造化データ（E-E-A-T 補強と、検索エンジンへの同一性の明示）
 *
 * ブランド名が一般語なので、どの実体を指すのかを機械可読にしておく。
 * sameAs に運営しているアカウントを並べると、同名の別ブランドとの区別が付きやすくなる。 */
const SITE_URL = "https://www.getabarrel.com";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "BARREL",
  alternateName: "BARREL（バレル）",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/barrel-logo.png`,
  description: "スポーツ科学の研究知見を、指導者・選手・保護者が現場で使える形に翻訳して届ける編集メディア。",
  sameAs: [
    "https://x.com/getabarrel",
    "https://www.threads.com/@getabarrel",
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "BARREL",
  alternateName: ["BARREL スポーツ科学メディア", "getabarrel"],
  url: SITE_URL,
  inLanguage: "ja",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // --font-* は :root の --f-* から参照するため、body ではなく html に付ける
  return (
    <html lang="ja" className={`${oswald.variable} ${ibmPlexMono.variable}`}>
      <body style={{ fontFamily: "var(--f-body)" }}>
        {/* スキップリンク */}
        <a href="#main" className="skip-link">
          本文へ
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />

        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />

        {/* GA4（NEXT_PUBLIC_GA_ID が設定されているときのみ読み込む） */}
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
