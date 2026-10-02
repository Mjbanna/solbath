import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="py-20 sm:py-28">
      <Container className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 font-heading text-3xl text-ink sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          The page you are looking for has moved or no longer exists. Browse the
          catalogue, or get in touch and we will point you to the right product.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-none bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark">
            Back to home
          </Link>
          <Link href="/contact" className="rounded-none border border-border px-6 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent">
            Contact us
          </Link>
        </div>
      </Container>
    </div>
  );
}
