import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Placeholder";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Testimonials } from "@/components/home/Testimonials";

export const metadata = {
  title: "About SolBath",
  alternates: { canonical: "/about" },
  description: "SolBath's story, quality commitments and milestones.",
};

const milestones = [
  { year: "2010", label: "SolBath founded as a regional sanitaryware distributor" },
  { year: "2014", label: "Launched in-house ceramic tile manufacturing partnerships" },
  { year: "2018", label: "Expanded into architectural hardware" },
  { year: "2022", label: "Opened flagship Experience Studio in Ahmedabad" },
  { year: "2026", label: "Introduced kitchen fittings, surfaces and storage" },
  { year: "2026", label: "Serving 6 showrooms across Gujarat & Maharashtra" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy">
        <Placeholder tone="lifestyle" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <Container className="relative flex min-h-[45vh] flex-col justify-end gap-3 py-16">
        <JsonLd data={graph([breadcrumbNode([{ name: "About SolBath", path: "/about" }])])} />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-soft">
            About SolBath
          </p>
          <h1 className="max-w-xl font-heading text-4xl text-white sm:text-5xl">
            Considered surfaces and fittings, for the long run
          </h1>
        </Container>
      </section>

      <TrustStrip />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Our Story"
              title="Built on fittings and finishes that outlast trends"
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
              <p>
                SolBath brings together bathroom accessories, ceramic tiles, hardware and kitchen
                solutions under one roof, so architects, dealers and homeowners can specify a
                complete space without juggling multiple vendors.
              </p>
              <p>
                We work directly with manufacturing partners to hold finish and quality
                standards that hold up to daily use, backed by warranties of up to 10 years on
                our fittings and sanitaryware.
              </p>
              <p>
                Every product on this site is chosen with one question in mind: will this still
                look and perform well a decade from now?
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Milestones
            </p>
            <div className="mt-6 space-y-6 border-l border-border pl-6">
              {milestones.map((m) => (
                <div key={`${m.year}-${m.label}`} className="relative">
                  <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-none bg-accent" />
                  <p className="font-heading text-lg text-ink">{m.year}</p>
                  <p className="mt-1 text-sm text-ink-soft">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Testimonials />
    </div>
  );
}
