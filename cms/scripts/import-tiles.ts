/**
 * Converts seed-data/source/tiles_details.xlsx into seed-data/tiles.generated.ts
 * (ceramic-tiles vertical: one Category per spreadsheet category, one Product
 * per category x series, spreadsheet sizes as the product's size options).
 *
 *   npx tsx scripts/import-tiles.ts          # regenerate, then commit both files
 *   npx tsx scripts/seed.ts                  # push to Strapi (tiles records re-sync)
 *
 * The spreadsheet is the source of truth for categories, series and sizes; the
 * copy below (TILE_COPY) is hand-written and is the only other input. Any
 * inconsistency in the sheet stops the script instead of producing bad data.
 */
import fs from "fs";
import path from "path";
import JSZip from "jszip";

import { normalize } from "./lib/normalize";

const SOURCE =
  process.env.TILES_XLSX ?? path.join(__dirname, "..", "seed-data", "source", "tiles_details.xlsx");
const OUTPUT = path.join(__dirname, "..", "seed-data", "tiles.generated.ts");
const VERTICAL = "ceramic-tiles";
const ALL_SIZES_SERIES = "all sizes series";

// Drafted copy — NEEDS REVIEW by the client before production. Deliberately
// free of technical claims (thickness, water absorption, PEI, ...): the
// spreadsheet has none, and nothing here should state specs we don't have.
const TILE_COPY: Record<string, { tagline: string; blurb: string }> = {
  "Floor Tiles": {
    tagline: "Floors for every room, from classic squares to large-format slabs.",
    blurb: "Floor tiles for living rooms, bedrooms, lobbies and commercial spaces.",
  },
  "Wall Tiles": {
    tagline: "Walls with texture, tone and character.",
    blurb: "Wall tiles for feature walls, living spaces and everyday interiors.",
  },
  "Bathroom Tiles": {
    tagline: "Tiles made for the bath, floor to ceiling.",
    blurb: "Tiles for bathroom floors and walls, chosen for spaces that see water every day.",
  },
  "Kitchen Tiles": {
    tagline: "Surfaces for the heart of the home.",
    blurb: "Tiles for kitchen walls, backsplashes and work areas that are easy to keep clean.",
  },
  "Outdoor Tiles": {
    tagline: "Built for terraces, pathways and open-air living.",
    blurb: "Tiles for terraces, balconies, pathways and other outdoor areas.",
  },
  "Ceramic Tiles": {
    tagline: "Everyday ceramic, in sizes for every room.",
    blurb: "Ceramic tiles for residential floors and walls.",
  },
  "Vitrified Tiles": {
    tagline: "A clean, consistent finish for modern floors.",
    blurb: "Vitrified tiles for floors in homes, offices and commercial spaces.",
  },
  "D.C. Tiles": {
    tagline: "Double-charge tiles for floors that work hard.",
    blurb: "D.C. (double-charge) tiles for floors in homes and busy commercial spaces.",
  },
  "Nano Tiles": {
    tagline: "A polished look that stays on show.",
    blurb: "Nano-finish tiles for floors in homes, showrooms and retail spaces.",
  },
  "Parking Tiles": {
    tagline: "Tough surfaces for driveways and parking.",
    blurb: "Tiles for parking areas, driveways and other spaces that take vehicle traffic.",
  },
};

// ---------------------------------------------------------------- xlsx ------

function decodeXml(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function textOf(xml: string): string {
  const parts: string[] = [];
  const re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) parts.push(decodeXml(m[1]));
  return parts.join("");
}

/** Every sheet as rows of trimmed strings, keyed by sheet name. */
async function readWorkbook(file: string): Promise<Map<string, string[][]>> {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const read = async (p: string) => {
    const entry = zip.file(p);
    if (!entry) throw new Error(`${path.basename(file)}: missing ${p}`);
    return entry.async("string");
  };

  const shared: string[] = [];
  if (zip.file("xl/sharedStrings.xml")) {
    const sst = await read("xl/sharedStrings.xml");
    const re = /<si>([\s\S]*?)<\/si>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sst))) shared.push(textOf(m[1]));
  }

  const rels = new Map<string, string>();
  const relXml = await read("xl/_rels/workbook.xml.rels");
  for (const m of relXml.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /\bId="([^"]+)"/.exec(m[0])?.[1];
    const target = /\bTarget="([^"]+)"/.exec(m[0])?.[1];
    if (id && target) rels.set(id, target.replace(/^\//, "").replace(/^(?!xl\/)/, "xl/"));
  }

  const sheets = new Map<string, string[][]>();
  const wb = await read("xl/workbook.xml");
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = decodeXml(/\bname="([^"]+)"/.exec(m[0])?.[1] ?? "");
    const rid = /\br:id="([^"]+)"/.exec(m[0])?.[1] ?? "";
    const target = rels.get(rid);
    if (!target) throw new Error(`Sheet "${name}" has no worksheet part`);
    const xml = await read(target);

    const rows: string[][] = [];
    for (const row of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells: string[] = [];
      for (const c of row[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = /\br="([A-Z]+)\d+"/.exec(c[1])?.[1] ?? "";
        const type = /\bt="([^"]+)"/.exec(c[1])?.[1];
        const body = c[2] ?? "";
        const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
        let value = "";
        if (type === "s" && v !== undefined) value = shared[Number(v)] ?? "";
        else if (type === "inlineStr") value = textOf(body);
        else if (v !== undefined) value = decodeXml(v);
        const col = ref.split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        cells[col] = value.trim();
      }
      rows.push(Array.from(cells, (x) => x ?? ""));
    }
    sheets.set(name, rows);
  }
  return sheets;
}

// ------------------------------------------------------------ validate ------

function fail(msg: string): never {
  throw new Error(`tiles_details.xlsx: ${msg}`);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "600 x 1200" / "600X1200" / "600×1200" -> {w: 600, h: 1200, label: "600×1200 mm"} */
function parseSize(raw: string, where: string) {
  const m = /^(\d+)\s*[x×X*]\s*(\d+)$/.exec(raw);
  if (!m) fail(`${where}: size "${raw}" is not <width>×<height>`);
  const w = Number(m[1]);
  const h = Number(m[2]);
  return { w, h, label: `${w}×${h} mm` };
}

/** "A, B, C" -> ["A","B","C"]; "All sizes series" -> [null] (a single un-lettered series). */
function parseGrades(raw: string, where: string): (string | null)[] {
  if (raw.toLowerCase() === ALL_SIZES_SERIES) return [null];
  const grades = raw.split(",").map((g) => g.trim().toUpperCase());
  if (grades.some((g) => !/^[A-Z]$/.test(g))) fail(`${where}: series "${raw}" is not a comma-separated list of letters`);
  if (new Set(grades).size !== grades.length) fail(`${where}: duplicate series in "${raw}"`);
  return grades;
}

// ---------------------------------------------------------------- main ------

interface GeneratedProduct {
  slug: string;
  name: string;
  collection: string;
  finishes: string[];
  sizes: string[];
  tags: string[];
  [key: string]: unknown;
}

async function main() {
  const sheets = await readWorkbook(SOURCE);
  const details = sheets.get("Tiles Details") ?? fail('missing sheet "Tiles Details"');
  const summary = sheets.get("Category Summary");

  const [header, ...rows] = details.filter((r) => r.some(Boolean));
  const expected = ["Category", "Series / Grade", "Size (mm)"];
  if (expected.some((h, i) => header[i] !== h)) fail(`"Tiles Details" header is ${JSON.stringify(header)}, expected ${JSON.stringify(expected)}`);

  // Group rows by category, preserving first-seen order.
  const byCategory = new Map<string, { gradesRaw: string; sizes: ReturnType<typeof parseSize>[] }>();
  rows.forEach((r, i) => {
    const where = `"Tiles Details" row ${i + 2}`;
    const [category, gradesRaw, sizeRaw] = r;
    if (!category || !gradesRaw || !sizeRaw) fail(`${where}: empty cell in ${JSON.stringify(r)}`);
    const size = parseSize(sizeRaw, where);
    const entry = byCategory.get(category) ?? { gradesRaw, sizes: [] };
    if (entry.gradesRaw !== gradesRaw) fail(`${where}: "${category}" has series "${gradesRaw}" but earlier rows say "${entry.gradesRaw}"`);
    if (entry.sizes.some((s) => s.w === size.w && s.h === size.h)) fail(`${where}: duplicate size ${sizeRaw} for "${category}"`);
    entry.sizes.push(size);
    byCategory.set(category, entry);
  });

  // Cross-check against the summary sheet when present.
  if (summary) {
    const [, ...sumRows] = summary.filter((r) => r.some(Boolean));
    for (const [category, gradesRaw, count] of sumRows) {
      const d = byCategory.get(category);
      if (!d) fail(`"Category Summary" lists "${category}", which has no rows in "Tiles Details"`);
      if (d.gradesRaw !== gradesRaw) fail(`"Category Summary" series for "${category}" is "${gradesRaw}", details say "${d.gradesRaw}"`);
      if (Number(count) !== d.sizes.length) fail(`"Category Summary" says ${count} sizes for "${category}", details have ${d.sizes.length}`);
    }
    if (sumRows.length !== byCategory.size) fail(`"Category Summary" has ${sumRows.length} categories, details have ${byCategory.size}`);
  }

  const categories: object[] = [];
  const products: object[] = [];
  for (const [name, { gradesRaw, sizes }] of byCategory) {
    const copy = TILE_COPY[name] ?? fail(`no copy for new category "${name}" — add it to TILE_COPY`);
    const slug = slugify(name);
    const grades = parseGrades(gradesRaw, `"${name}"`);
    const multi = grades.length > 1;
    const sorted = [...sizes].sort((a, b) => a.w * a.h - b.w * b.h || a.w - b.w);
    const sizeLabels = sorted.map((s) => s.label);
    const seriesLabels = grades.map((g) => (g ? `Series ${g}` : "All Sizes Series"));

    const range = `${sorted[0].w}×${sorted[0].h} to ${sorted[sorted.length - 1].w}×${sorted[sorted.length - 1].h} mm`;
    categories.push({
      slug,
      vertical: VERTICAL,
      name,
      tagline: copy.tagline,
      description: `${copy.blurb} Available ${multi ? `in ${grades.length} series, ` : ""}in ${sizes.length} sizes from ${range}.`,
      filters: [
        ...(multi ? [{ label: "Series", options: seriesLabels }] : []),
        { label: "Size", options: sizeLabels },
      ],
      syncOnSeed: true,
    });

    const categoryProducts: GeneratedProduct[] = [];
    grades.forEach((grade, i) => {
      const series = seriesLabels[i];
      categoryProducts.push({
        slug: grade ? `${slug}-series-${grade.toLowerCase()}` : `${slug}-all-sizes`,
        vertical: VERTICAL,
        categorySlug: slug,
        name: multi ? `${name} – ${series}` : name,
        collection: series,
        shortDescription: `${name}, ${series}, in ${sizes.length} sizes from ${range}.`,
        description: `${copy.blurb} ${series} is offered in ${sizes.length} sizes: ${sizeLabels.join(", ")}.`,
        finishes: [],
        sizes: sizeLabels,
        specs: [
          { label: "Category", value: name },
          { label: "Series", value: grade ?? "All sizes" },
          { label: "Sizes available", value: String(sizes.length) },
          { label: "Size range", value: range },
        ],
        tags: [],
        tone: "tile",
        syncOnSeed: true,
      });
    });

    // The category page keeps a product for an option when the normalized
    // option is a SUBSTRING of any of its name/collection/finishes/sizes/tags
    // (CategoryProductBrowser + productMatchesOption). Simulate exactly that
    // and require every option to select precisely the products it should.
    for (const [label, opts] of [["Series", multi ? seriesLabels : []], ["Size", sizeLabels]] as const) {
      for (const opt of opts) {
        const got = categoryProducts
          .filter((p) => [p.name, p.collection, ...p.finishes, ...p.sizes, ...p.tags].some((c) => normalize(c).includes(normalize(opt))))
          .map((p) => p.slug);
        const want = categoryProducts
          .filter((p) => (label === "Series" ? p.collection === opt : p.sizes.includes(opt)))
          .map((p) => p.slug);
        if (got.join() !== want.join()) fail(`"${name}": filter "${label}: ${opt}" would select [${got}] instead of [${want}]`);
      }
    }
    products.push(...categoryProducts);
  }

  const banner =
    "// GENERATED by scripts/import-tiles.ts from seed-data/source/tiles_details.xlsx.\n" +
    "// Do not edit by hand — change the spreadsheet (or TILE_COPY) and re-run:\n" +
    "//   npx tsx scripts/import-tiles.ts\n";
  const out =
    `${banner}import type { Category, Product } from "./types";\n\n` +
    `export const tileCategories: Category[] = ${JSON.stringify(categories, null, 2)};\n\n` +
    `export const tileProducts: Product[] = ${JSON.stringify(products, null, 2)};\n`;
  fs.writeFileSync(OUTPUT, out);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)}: ${categories.length} categories, ${products.length} products.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
