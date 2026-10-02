import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { getProduct } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = pageMetadata({
  title: "Request a Quote",
  description: "Request a quote for one or more SolBath products.",
  path: "/quote",
});

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const params = await searchParams;
  const productSlug = typeof params.product === "string" ? params.product : undefined;
  const persona = typeof params.persona === "string" ? params.persona : undefined;
  const [product, site] = await Promise.all([
    productSlug ? getProduct(productSlug) : Promise.resolve(undefined),
    getSiteSettings(),
  ]);

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <JsonLd data={graph([breadcrumbNode([{ name: "Request a Quote", path: "/quote" }])])} />
        <SectionHeading
          eyebrow="Request a Quote"
          title="Tell us what you need"
          description="Whether it's a single product or a full project list, share your requirements and our team will follow up with pricing and availability."
        />
        <div className="mt-12">
          <QuoteForm
            initialPersona={persona}
            initialProduct={product?.name}
            whatsappNumber={site.whatsappNumber}
          />
        </div>
      </Container>
    </div>
  );
}
