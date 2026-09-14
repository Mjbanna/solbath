import { Container } from "@/components/ui/Container";

export const metadata = { title: "Terms of Use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <h1 className="font-heading text-3xl text-ink">Terms of Use</h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          Placeholder page. Final terms of use will be added before launch.
        </p>
      </Container>
    </div>
  );
}
