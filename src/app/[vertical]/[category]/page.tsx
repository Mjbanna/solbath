import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph, itemListNode } from "@/lib/seo/jsonld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Vertical } from "@/lib/types";
import { getVerticalMeta, getCategory, getAllCategories } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { CategoryProductBrowser } from "@/components/product/CategoryProductBrowser";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ vertical: cat.vertical, category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[vertical]/[category]">) {
  const { vertical, category } = await params;
  const cat = await getCategory(vertical as Vertical, category);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.tagline,
    alternates: { canonical: `/${vertical}/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[vertical]/[category]">) {
  const { vertical, category } = await params;
  const [verticalMeta, cat] = await Promise.all([
    getVerticalMeta(),
    getCategory(vertical as Vertical, category),
  ]);
  const meta = verticalMeta[vertical as Vertical];
  if (!meta || !cat) notFound();

  const products = await getProductsByCategory(vertical as Vertical, category);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <JsonLd
          data={graph([
            breadcrumbNode([
              { name: meta.name, path: `/${vertical}` },
              { name: cat.name, path: `/${vertical}/${cat.slug}` },
            ]),
            itemListNode(products, cat.name),
          ])}
        />
        <p className="text-xs font-medium text-ink-soft">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>{" "}
          /{" "}
          <Link href={`/${vertical}`} className="hover:text-accent">
            {meta.name}
          </Link>{" "}
          / {cat.name}
        </p>

        <div className="mt-4 max-w-2xl">
          <h1 className="font-heading text-3xl text-ink sm:text-4xl">{cat.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">{cat.description}</p>
        </div>

        <div className="mt-10">
          <CategoryProductBrowser category={cat} products={products} />
        </div>
      </Container>
    </div>
  );
}
