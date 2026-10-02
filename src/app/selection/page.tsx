import { pageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SelectionList } from "@/components/selection/SelectionList";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = pageMetadata({
  title: "My Selection",
  description: "Products you've shortlisted for a quote.",
  path: "/selection",
  // A visitor"s personal shortlist - no search value.
  noIndex: true,
});

export default async function SelectionPage() {
  const site = await getSiteSettings();

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="My Selection"
          title="Your shortlisted products"
          description="Review your selection, then submit it as a single quote request or share it with our team on WhatsApp."
        />
        <div className="mt-12 max-w-2xl">
          <SelectionList whatsappNumber={site.whatsappNumber} />
        </div>
      </Container>
    </div>
  );
}
