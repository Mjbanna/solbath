import { FileDown, Users2, Percent, Headset } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata = {
  title: "For Architects & Dealers",
  alternates: { canonical: "/for-trade" },
  description: "Trade resources, bulk quoting and project support for architects, designers, dealers and contractors.",
};

const architectPerks = [
  { icon: FileDown, title: "Technical Data Sheets", detail: "Downloadable specs, CAD blocks and installation guides for every product." },
  { icon: Headset, title: "Dedicated Project Support", detail: "A single point of contact for project-scale specification and sampling." },
];

const dealerPerks = [
  { icon: Percent, title: "Bulk & Project Pricing", detail: "Slab-rate pricing for volume orders, quoted against your project BOQ." },
  { icon: Users2, title: "Fast Turnaround", detail: "Priority processing on quotes and dispatch for registered partners." },
];

export default function ForTradePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy">
        <Placeholder tone="lifestyle" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <Container className="relative flex min-h-[40vh] flex-col justify-end gap-3 py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-soft">
            Trade Resources
          </p>
          <h1 className="max-w-xl font-heading text-4xl text-white sm:text-5xl">
            For architects, designers, dealers & contractors
          </h1>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Architects & Designers" title="Specify with confidence" />
            <div className="mt-8 space-y-6">
              {architectPerks.map((perk) => (
                <div key={perk.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-accent-soft text-accent-dark">
                    <perk.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{perk.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{perk.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button href="/quote?persona=architect" className="mt-8">
              Request Project Support
            </Button>
          </div>

          <div>
            <SectionHeading eyebrow="Dealers & Contractors" title="Partner with SolBath" />
            <div className="mt-8 space-y-6">
              {dealerPerks.map((perk) => (
                <div key={perk.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-accent-soft text-accent-dark">
                    <perk.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{perk.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{perk.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button href="/quote?persona=dealer" className="mt-8">
              Become a Partner
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
