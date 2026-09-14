import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SelectionProvider } from "@/components/selection-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Resolves every page's relative `alternates.canonical` against the apex
  // origin. Canonicals are set per page, never here: a canonical in the root
  // layout would be inherited by every route and point them all at "/".
  metadataBase: new URL(SITE_URL),
  ...(SITE_INDEXABLE ? {} : { robots: { index: false, follow: false } }),
  title: {
    default: "SolBath - Bathroom Accessories, Ceramic Tiles, Hardware & Kitchen",
    template: "%s | SolBath",
  },
  description:
    "Premium bathroom accessories, ceramic tiles, hardware and kitchen solutions. Browse the catalog, get inspired, and request a quote.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">
        <SelectionProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
          <BackToTopButton />
          <WhatsAppButton />
        </SelectionProvider>
      </body>
    </html>
  );
}
