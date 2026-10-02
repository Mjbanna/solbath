/**
 * Renders JSON-LD into the server response (no client JS): answer engines and
 * crawlers that do not execute scripts still see it.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped for safe embedding in a <script>.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
