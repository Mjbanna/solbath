import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CatalogDownloadButton } from "@/components/catalogs/CatalogDownloadButton";
import { CatalogViewButton } from "@/components/catalogs/CatalogViewButton";
import { getCatalogs } from "@/lib/data/catalogs";
import { getVerticalMeta } from "@/lib/data/categories";

export const metadata = {
  title: "Download Catalogues",
  alternates: { canonical: "/catalogues" },
  description: "Download SolBath product catalogues by category.",
};

export default async function CataloguesPage() {
  const [catalogs, verticalMeta] = await Promise.all([getCatalogs(), getVerticalMeta()]);

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <JsonLd data={graph([breadcrumbNode([{ name: "Catalogues", path: "/catalogues" }])])} />
        <SectionHeading
          eyebrow="Resources"
          title="Download our catalogues"
          description="Full product ranges, specs and finishes - organized by category. Catalogue PDFs will be uploaded and kept up to date through the CMS."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {catalogs.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-4 rounded-none border border-border p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-stone text-accent">
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-ink">{cat.title}</p>
                  <p className="text-xs text-ink-soft">
                    {cat.vertical === "all" ? "Company-wide" : verticalMeta[cat.vertical].name} ·{" "}
                    {cat.fileSize}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {cat.fileUrl ? <CatalogViewButton pdfUrl={cat.fileUrl} title={cat.title} /> : null}
                <CatalogDownloadButton fileUrl={cat.fileUrl} title={cat.title} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
