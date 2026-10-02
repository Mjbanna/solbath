import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SelectionProvider } from "@/components/selection-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_NAME } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/data/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, localBusinessNode, organizationNode } from "@/lib/seo/jsonld";

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
  description: DEFAULT_DESCRIPTION,
  // Defaults for anything without its own set (e.g. the 404 page). Pages build
  // their full tags through pageMetadata() because Next replaces, not merges,
  // the openGraph object.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getSiteSettings();
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">
        {/* Identity of the business, on every page, in the server response. */}
        <JsonLd data={graph([organizationNode(site), localBusinessNode(site)])} />
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
