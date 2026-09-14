import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DealerLocator } from "@/components/dealers/DealerLocator";
import { getDealers } from "@/lib/data/dealers";
import { getVerticalMeta } from "@/lib/data/categories";

export const metadata = {
  title: "Find a Dealer",
  alternates: { canonical: "/dealers" },
  description: "Locate a SolBath showroom or dealer partner near you.",
};

export default async function DealersPage() {
  const [dealers, verticalMeta] = await Promise.all([getDealers(), getVerticalMeta()]);
  const dealerCities = Array.from(new Set(dealers.map((d) => d.city))).sort();

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <SectionHeading
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
