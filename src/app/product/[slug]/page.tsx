import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, faqNode, graph, productNode } from "@/lib/seo/jsonld";
import { productFaqs, productLead } from "@/lib/seo/aeo";
import { FaqSection } from "@/components/content/FaqSection";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { SpecTable } from "@/components/product/SpecTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getProduct, getRelatedProducts, getAllProductSlugs } from "@/lib/data/products";
import { getVerticalMeta, getCategory } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/site";

export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/product/${product.slug}`,
    images: product.images?.length ? product.images.slice(0, 1) : undefined,
  });
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [verticalMeta, category, related, site] = await Promise.all([
    getVerticalMeta(),
    getCategory(product.vertical, product.categorySlug),
    getRelatedProducts(product),
    getSiteSettings(),
  ]);
  const meta = verticalMeta[product.vertical];
  const faqs = productFaqs(product, site);
  const lead = productLead(product, category?.name);

  return (
    <div>
      <JsonLd
        data={graph([
          breadcrumbNode([
            { name: meta.name, path: `/${product.vertical}` },
            ...(category ? [{ name: category.name, path: `/${product.vertical}/${category.slug}` }] : []),
            { name: product.name, path: `/product/${product.slug}` },
          ]),
          productNode(product, category?.name),
          ...(faqs.length ? [faqNode(faqs)] : []),
        ])}
      />
      <div className="py-8 sm:py-12">
        <Container>
          <p className="text-xs font-medium text-ink-soft">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>{" "}
            /{" "}
            <Link href={`/${product.vertical}`} className="hover:text-accent">
              {meta.name}
            </Link>{" "}
            /{" "}
            <Link href={`/${product.vertical}/${product.categorySlug}`} className="hover:text-accent">
              {category?.name}
            </Link>{" "}
            / {product.name}
          </p>

          <div className="mt-6 grid gap-12 lg:grid-cols-2">
            <ProductGallery tone={product.tone} name={product.name} images={product.images} />

            <div>
              <div className="flex flex-wrap gap-2">
                {product.isNew ? <Badge tone="ink">New</Badge> : null}
                {product.tags.includes("Bestseller") ? <Badge tone="accent">Bestseller</Badge> : null}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-accent">
                {product.collection}
              </p>
              <h1 className="mt-2 font-heading text-3xl text-ink sm:text-4xl">{product.name}</h1>
              {/* Answer-first: the factual summary precedes the description. */}
              {lead ? <p className="mt-4 text-base font-medium leading-relaxed text-ink">{lead}</p> : null}
              <p className="mt-4 text-base leading-relaxed text-ink-soft">{product.description}</p>

              <div className="mt-8 border-t border-border pt-8">
                <ProductActions product={product} whatsappNumber={site.whatsappNumber} />
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-3xl">
            <h2 className="font-heading text-2xl text-ink">Specifications</h2>
            <div className="mt-5">
              <SpecTable specs={product.specs} caption={`Specifications for ${product.name}`} />
            </div>
          </div>
          <FaqSection faqs={faqs} />
        </Container>
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
