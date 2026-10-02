import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Container } from "@/components/ui/Container";
import { Placeholder } from "@/components/ui/Placeholder";
import { getPost, getPosts } from "@/lib/data/posts";
import { getProduct } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/inspiration/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/inspiration/${post.slug}` },
  };
}

export default async function InspirationDetailPage({
  params,
}: PageProps<"/inspiration/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [relatedProductsRaw, allPosts] = await Promise.all([
    Promise.all(post.relatedProductSlugs.map((s) => getProduct(s))),
    getPosts(),
  ]);
  const relatedProducts = relatedProductsRaw.filter((p): p is NonNullable<typeof p> =>
    Boolean(p),
  );

  const morePosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <JsonLd
          data={graph([
            breadcrumbNode([
              { name: "Inspiration", path: "/inspiration" },
              { name: post.title, path: `/inspiration/${post.slug}` },
            ]),
          ])}
        />
        <p className="text-xs font-medium text-ink-soft">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/inspiration" className="hover:text-accent">
            Inspiration
          </Link>{" "}
          / {post.title}
        </p>

        <div className="mx-auto mt-6 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
            {post.room} · {post.readTime}
          </p>
          <h1 className="mt-3 font-heading text-3xl text-ink sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{post.excerpt}</p>
        </div>

        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-none">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          ) : (
            <Placeholder tone={post.tone} label={post.title} className="h-full w-full" />
          )}
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-5 text-base leading-relaxed text-ink-soft [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:text-ink [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
          {post.body ? (
            <ReactMarkdown>{post.body}</ReactMarkdown>
          ) : (
            <>
              <p>
                When planning this look, we started with the fittings and let the surfaces
                follow - choosing finishes that would age gracefully and pairing them with
                tiles or hardware that add warmth without competing for attention.
              </p>
              <p>
                The result is a space that feels considered rather than curated: every product
                earns its place, and every finish has been chosen to work together across at
                least a decade of daily use.
              </p>
              <p>
                Below are the exact products featured in this story - tap through for full
                specs, finish options and to add them to your quote list.
              </p>
            </>
          )}
        </div>

        {relatedProducts.length > 0 ? (
          <div className="mx-auto mt-14 max-w-5xl">
            <h2 className="font-heading text-2xl text-ink">Shop This Story</h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-16 max-w-5xl border-t border-border pt-10">
          <h2 className="font-heading text-2xl text-ink">More Stories</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {morePosts.map((p) => (
              <Link key={p.slug} href={`/inspiration/${p.slug}`} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-none">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <Placeholder tone={p.tone} label={p.room} className="h-full w-full" />
                  )}
                </div>
                <h3 className="mt-3 font-heading text-lg text-ink group-hover:text-accent-dark">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
