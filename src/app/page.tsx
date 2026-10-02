import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webSiteNode } from "@/lib/seo/jsonld";
import { getSiteSettings } from "@/lib/data/site";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { PersonaTiles } from "@/components/home/PersonaTiles";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { InspirationTeaser } from "@/components/home/InspirationTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const site = await getSiteSettings();
  return (
    <>
      <JsonLd data={graph([webSiteNode(site)])} />
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
      <PersonaTiles />
      <FeaturedProducts />
      <InspirationTeaser />
      <Testimonials />
      <CtaBand />
    </>
  );
}
