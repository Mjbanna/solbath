import type { Faq } from "@/lib/seo/jsonld";

/**
 * Server-rendered Q&A. The answer sits immediately after its question so an
 * answer engine can lift the pair without running any JavaScript.
 */
export function FaqSection({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="font-heading text-2xl text-ink">{title}</h2>
      <dl className="mt-6 divide-y divide-border border-t border-border">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-5">
            <dt>
              <h3 className="font-heading text-lg text-ink">{faq.question}</h3>
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
