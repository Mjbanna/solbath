import { Container } from "@/components/ui/Container";

export const metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy-policy" } };

export default function PrivacyPolicyPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <h1 className="font-heading text-3xl text-ink">Privacy Policy</h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          Placeholder page. Final privacy policy content — covering how enquiry, quote and
          contact form data is collected, stored and used — will be added before launch.
        </p>
      </Container>
    </div>
  );
}
