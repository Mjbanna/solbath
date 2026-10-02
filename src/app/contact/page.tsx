import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";
import { Placeholder } from "@/components/ui/Placeholder";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = pageMetadata({
  title: "Contact Us",
  description: "Get in touch with the SolBath team.",
  path: "/contact",
});

export default async function ContactPage() {
  const site = await getSiteSettings();

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <JsonLd data={graph([breadcrumbNode([{ name: "Contact", path: "/contact" }])])} />
        <SectionHeading as="h1" eyebrow="Get in Touch" title="We'd love to hear from you" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            <div className="aspect-[4/3] overflow-hidden rounded-none">
              <Placeholder tone="lifestyle" label="Map" className="h-full w-full" />
            </div>
            <div className="space-y-4 text-sm text-ink-soft">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent" /> {site.address}
              </p>
              <p className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-accent" /> {site.phone}
              </p>
              <p className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-accent" /> {site.email}
              </p>
              <p className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-accent" /> Mon–Sat, 10am–7pm
              </p>
            </div>
          </div>

          <div className="rounded-none border border-border p-8">
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
