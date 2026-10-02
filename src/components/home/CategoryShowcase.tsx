import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Placeholder } from "@/components/ui/Placeholder";
import { getVerticalMeta } from "@/lib/data/categories";

export async function CategoryShowcase() {
  const verticalMeta = await getVerticalMeta();
  const items = Object.values(verticalMeta);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        {/* The cards below are h3; this keeps the document outline intact
            without changing the design. */}
        <h2 className="sr-only">Product ranges</h2>
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-none"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Placeholder
                  tone={item.tone}
                  label={item.name}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-heading text-2xl text-white">{item.name}</h3>
                  <p className="mt-2 max-w-xs text-sm text-white/75">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white">
                    Explore Range
                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
