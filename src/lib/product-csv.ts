type RelatedMode = "category" | "manual";

type CsvPackage = {
  name: string;
  slug: string;
  summary: string;
  body: string;
  image: string;
  gallery: string[];
  categorySlugs: string[];
  relatedMode: RelatedMode;
  relatedSlugs: string[];
  extraContent: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HEADER_ALIASES: Record<string, string[]> = {
  name: ["name", "title", "product name", "product_name"],
  slug: ["slug", "sku", "permalink"],
  summary: ["summary", "short description", "short_description", "excerpt"],
  body: ["body", "description", "content", "long description"],
  image: ["image", "featured image", "featured_image", "featured image url"],
  gallery: ["gallery", "images", "image urls", "gallery images"],
  categories: ["categories", "category", "categoryslugs", "category_slugs", "category slugs"],
  relatedMode: ["relatedmode", "related_mode", "related mode"],
  relatedSlugs: ["relatedslugs", "related_slugs", "related slugs", "upsells", "cross-sells"],
  extraContent: ["extracontent", "extra_content", "extra content"],
  published: ["published", "status"],
};

export type ProductCsvHas = {
  summary: boolean;
  body: boolean;
  image: boolean;
  gallery: boolean;
  categories: boolean;
  relatedMode: boolean;
  relatedSlugs: boolean;
  extraContent: boolean;
};

export type ProductCsvRow = {
  line: number;
  name: string;
  slug: string;
  summary: string;
  body: string;
  image: string;
  gallery: string[];
  categoryValues: string[];
  relatedMode: RelatedMode;
  relatedSlugs: string[];
  extraContent: string;
  skip: string;
  has: ProductCsvHas;
};

export type ProductCsvIssue = {
  line: number;
  message: string;
};

export type ProductCsvParseResult = {
  rows: ProductCsvRow[];
  issues: ProductCsvIssue[];
  headers: string[];
};

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[_-]+/g, " ");
}

function headerKey(header: string): keyof typeof HEADER_ALIASES | null {
  const normalized = normalizeHeader(header);
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((alias) => alias === normalized)) {
      return key as keyof typeof HEADER_ALIASES;
    }
  }
  return null;
}

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }
  if (quoted) {
    throw new Error("CSV has an unclosed quote.");
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((item) => item.some((cell) => cell.trim()));
}

export function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function splitList(value: string) {
  return value
    .split(/[|,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitImages(value: string) {
  return value
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCategories(value: string) {
  return value
    .split(/[|,]/)
    .map((item) => {
      const parts = item.split(">").map((part) => part.trim()).filter(Boolean);
      return parts[parts.length - 1] ?? "";
    })
    .filter(Boolean);
}

function isUnpublished(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized === "-1" || normalized === "draft" || normalized === "private" || normalized === "0";
}

export function parseProductCsv(text: string): ProductCsvParseResult {
  const table = parseCsv(text);
  if (table.length === 0) {
    throw new Error("CSV is empty.");
  }
  const headers = table[0];
  const map = new Map<string, number>();
  headers.forEach((header, index) => {
    const key = headerKey(header);
    if (key && !map.has(key)) {
      map.set(key, index);
    }
  });
  if (!map.has("name") && !map.has("slug")) {
    throw new Error("CSV needs a Name or SKU/slug column.");
  }

  const cell = (row: string[], key: string) => {
    const index = map.get(key);
    return index === undefined ? "" : (row[index] ?? "").trim();
  };
  const hasColumn = (key: string) => map.has(key);

  const rows: ProductCsvRow[] = [];
  const issues: ProductCsvIssue[] = [];

  table.slice(1).forEach((raw, index) => {
    const line = index + 2;
    const name = cell(raw, "name");
    const slugSource = cell(raw, "slug") || name;
    const slug = slugify(slugSource);
    const publishedValue = cell(raw, "published");
    const imageList = hasColumn("gallery") ? splitImages(cell(raw, "gallery")) : [];
    const featured = cell(raw, "image") || imageList[0] || "";
    const gallery = featured && imageList[0] === featured ? imageList.slice(1) : imageList.filter((url) => url !== featured);
    const skip = !name && !slug
      ? "Missing product name."
      : !slug
        ? "Could not build a slug from the name or SKU."
        : publishedValue && isUnpublished(publishedValue)
          ? "Skipped unpublished product."
          : "";

    if (!name && !slug) {
      issues.push({ line, message: skip });
      return;
    }

    rows.push({
      line,
      name: name || slug,
      slug,
      summary: cell(raw, "summary"),
      body: cell(raw, "body"),
      image: featured,
      gallery,
      categoryValues: hasColumn("categories") ? splitCategories(cell(raw, "categories")) : [],
      relatedMode: cell(raw, "relatedMode").toLowerCase() === "manual" ? "manual" : "category",
      relatedSlugs: hasColumn("relatedSlugs") ? splitList(cell(raw, "relatedSlugs")).map(slugify).filter(Boolean) : [],
      extraContent: cell(raw, "extraContent"),
      skip,
      has: {
        summary: hasColumn("summary"),
        body: hasColumn("body"),
        image: hasColumn("image") || hasColumn("gallery"),
        gallery: hasColumn("gallery"),
        categories: hasColumn("categories"),
        relatedMode: hasColumn("relatedMode"),
        relatedSlugs: hasColumn("relatedSlugs"),
        extraContent: hasColumn("extraContent"),
      },
    });
  });

  return { rows, issues, headers };
}

export function resolveCategorySlugs(
  values: string[],
  categories: { slug: string; name: string }[],
): { slugs: string[]; unknown: string[] } {
  const slugs: string[] = [];
  const unknown: string[] = [];
  for (const value of values) {
    const needle = value.trim().toLowerCase();
    const match = categories.find(
      (category) => category.slug === slugify(value) || category.name.trim().toLowerCase() === needle,
    );
    if (match) {
      if (!slugs.includes(match.slug)) {
        slugs.push(match.slug);
      }
    } else if (value.trim()) {
      unknown.push(value.trim());
    }
  }
  return { slugs, unknown };
}

export function packagesToCsv(packages: CsvPackage[], categoryNameBySlug: Record<string, string>) {
  const header = [
    "name",
    "slug",
    "summary",
    "body",
    "image",
    "gallery",
    "categories",
    "relatedMode",
    "relatedSlugs",
    "extraContent",
  ];
  const lines = [
    header.join(","),
    ...packages.map((item) =>
      [
        csvEscape(item.name),
        csvEscape(item.slug),
        csvEscape(item.summary),
        csvEscape(item.body),
        csvEscape(item.image),
        csvEscape([item.image, ...item.gallery].filter(Boolean).join(" | ")),
        csvEscape(item.categorySlugs.map((slug) => categoryNameBySlug[slug] ?? slug).join(" | ")),
        csvEscape(item.relatedMode),
        csvEscape(item.relatedSlugs.join(" | ")),
        csvEscape(item.extraContent),
      ].join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export const PRODUCT_CSV_SAMPLE = `name,slug,summary,body,image,gallery,categories
Kraft boxes with lid,kraft-boxes-with-lid,"Stylish kraft boxes with lids.","<p>Custom kraft lid boxes for retail and gifting.</p>",https://example.com/kraft-cover.jpg,https://example.com/kraft-2.jpg | https://example.com/kraft-3.jpg,Gift Boxes | Boxes with Lids
Custom Perfume Boxes,custom-perfume-boxes,"Fragrance boxes with luxury print.","<p>Premium perfume packaging with custom inserts.</p>",,/uploads/products/custom-perfume-boxes/cover.jpg,Cosmetic Boxes
`;
