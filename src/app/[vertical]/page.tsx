import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { Vertical } from "@/lib/types";
import { getVerticalMeta, getCategoriesByVertical } from "@/lib/data/categories";
import { getProductsByVertical } from "@/lib/data/products";

export async function generateStaticParams() {
  const verticalMeta = await getVerticalMeta();
  return Object.keys(verticalMeta).map((vertical) => ({ vertical }));
}

export async function generateMetadata({ params }: PageProps<"/[vertical]">) {
  const { vertical } = await params;
  const verticalMeta = await getVerticalMeta();
  const meta = verticalMeta[vertical as Vertical];
  if (!meta) return {};
  return pageMetadata({
    title: meta.name,
    description: meta.tagline,
    path: `/${meta.slug}`,
    images: meta.image ? [meta.image.src] : undefined,
  });
}

export default async function VerticalPage({ params }: PageProps<"/[vertical]">) {
  const { vertical } = await params;
  const verticalMeta = await getVerticalMeta();
  const meta = verticalMeta[vertical as Vertical];
  if (!meta) notFound();

  const [subcategories, allProductsInVertical] = await Promise.all([
    getCategoriesByVertical(vertical as Vertical),
    getProductsByVertical(vertical as Vertical),
  ]);
  const productsInVertical = allProductsInVertical.slice(0, 6);

  return (
    <>
      <JsonLd data={graph([breadcrumbNode([{ name: meta.name, path: `/${vertical}` }])])} />
      <section className="relative overflow-hidden bg-navy">
        <Placeholder
          tone={meta.tone}
          className="absolute inset-0 h-full w-full"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <Container className="relative flex min-h-[42vh] flex-col justify-end gap-3 py-16">
          <p className="text-xs font-medium text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / {meta.name}
          </p>
          <h1 className="max-w-xl font-heading text-4xl text-white sm:text-5xl">{meta.name}</h1>
          <p className="max-w-lg text-white/70">{meta.tagline}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Shop by category" title={`Browse ${meta.name}`} />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {subcategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${vertical}/${cat.slug}`}
                className="group flex flex-col overflow-hidden rounded-none border border-border"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Placeholder
                    tone={meta.tone}
                    label={cat.name}
                    className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg text-ink">{cat.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{cat.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-accent group-hover:text-accent-dark">
                    Shop Now <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-stone py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Popular right now" title={`Popular in ${meta.name}`} />
            <Button href={`/${vertical}/${subcategories[0]?.slug ?? ""}`} variant="ghost">
              View All
            </Button>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {productsInVertical.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col items-center gap-5 rounded-none bg-navy px-8 py-14 text-center">
          <h3 className="font-heading text-2xl text-white sm:text-3xl">
            Not sure which {meta.name.toLowerCase()} suit your project?
          </h3>
          <p className="max-w-lg text-sm text-white/70">
            Send us your requirements and our team will get back with the right products and
            a formal quote.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Button href="/quote">Request a Quote</Button>
            <Button href="/catalogues" variant="outline-light">
              Download Catalogue
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
