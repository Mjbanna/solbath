import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DealerLocator } from "@/components/dealers/DealerLocator";
import { getDealers } from "@/lib/data/dealers";
import { getVerticalMeta } from "@/lib/data/categories";

export const metadata = pageMetadata({
  title: "Find a Dealer",
  description: "Locate a SolBath showroom or dealer partner near you.",
  path: "/dealers",
});

export default async function DealersPage() {
  const [dealers, verticalMeta] = await Promise.all([getDealers(), getVerticalMeta()]);
  const dealerCities = Array.from(new Set(dealers.map((d) => d.city))).sort();

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <JsonLd data={graph([breadcrumbNode([{ name: "Dealers", path: "/dealers" }])])} />
        <SectionHeading as="h1"
          eyebrow="Showrooms & Dealers"
          title="Find a SolBath partner near you"
          description="See finishes and full room setups in person, or speak to a dealer partner for bulk and project quotes."
        />
        <div className="mt-12">
          <DealerLocator dealers={dealers} cities={dealerCities} verticalMeta={verticalMeta} />
        </div>
      </Container>
    </div>
  );
}
