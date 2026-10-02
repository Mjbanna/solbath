import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Placeholder";
import { getPosts } from "@/lib/data/posts";

export const metadata = {
  title: "Inspiration",
  alternates: { canonical: "/inspiration" },
  description: "Ideas, guides and room stories from the SolBath design desk.",
};

export default async function InspirationPage() {
  const posts = await getPosts();

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <JsonLd data={graph([breadcrumbNode([{ name: "Inspiration", path: "/inspiration" }])])} />
        <SectionHeading
          eyebrow="Inspiration"
          title="Ideas for every room"
          description="Design stories, buying guides and room-by-room inspiration to help you plan with confidence."
        />
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/inspiration/${post.slug}`} className="group flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-none">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <Placeholder
                    tone={post.tone}
                    label={post.room}
                    className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
                {post.room} · {post.readTime}
              </p>
              <h3 className="mt-1 font-heading text-xl leading-snug text-ink group-hover:text-accent-dark">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
