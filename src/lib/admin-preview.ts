import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { Category, Package } from "@/lib/catalog";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";

export type PackagePreview = {
  kind: "package";
  token: string;
  slug: string;
  createdAt: number;
  expiresAt: number;
  package: Package;
};

export type CategoryPreview = {
  kind: "category";
  token: string;
  slug: string;
  createdAt: number;
  expiresAt: number;
  category: Category;
  productSlugs: string[];
};

export type AdminPreview = PackagePreview | CategoryPreview;

const PREVIEW_DIR = path.join(process.cwd(), ".data", "previews");
const TTL_MS = 60 * 60 * 1000;

async function ensureDir() {
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
}

function previewPath(token: string) {
  return path.join(PREVIEW_DIR, `${token}.json`);
}

function newToken() {
  return randomBytes(16).toString("hex");
}

async function writePreviewRecord(record: AdminPreview) {
  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    await prisma.adminPreviewRecord.upsert({
      where: { token: record.token },
      create: {
        token: record.token,
        data: record as object,
        expiresAt: new Date(record.expiresAt),
      },
      update: {
        data: record as object,
        expiresAt: new Date(record.expiresAt),
      },
    });
    return;
  }
  await ensureDir();
  await fs.writeFile(previewPath(record.token), `${JSON.stringify(record)}\n`, "utf8");
}

export async function savePackagePreview(draft: Package): Promise<PackagePreview> {
  const token = newToken();
  const now = Date.now();
  const record: PackagePreview = {
    kind: "package",
    token,
    slug: draft.slug,
    createdAt: now,
    expiresAt: now + TTL_MS,
    package: draft,
  };
  await writePreviewRecord(record);
  return record;
}

export async function saveCategoryPreview(
  draft: Category,
  productSlugs: string[],
): Promise<CategoryPreview> {
  const token = newToken();
  const now = Date.now();
  const record: CategoryPreview = {
    kind: "category",
    token,
    slug: draft.slug,
    createdAt: now,
    expiresAt: now + TTL_MS,
    category: draft,
    productSlugs,
  };
  await writePreviewRecord(record);
  return record;
}

export async function readPreview(token: string): Promise<AdminPreview | null> {
  const clean = token.trim();
  if (!/^[a-f0-9]{32}$/i.test(clean)) {
    return null;
  }

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    const row = await prisma.adminPreviewRecord.findUnique({ where: { token: clean } });
    if (!row) {
      return null;
    }
    if (Date.now() > row.expiresAt.getTime()) {
      await prisma.adminPreviewRecord.delete({ where: { token: clean } }).catch(() => undefined);
      return null;
    }
    const data = row.data as AdminPreview;
    if (!data?.token || data.token !== clean) {
      return null;
    }
    return data;
  }

  try {
    const raw = await fs.readFile(previewPath(clean), "utf8");
    const data = JSON.parse(raw) as AdminPreview;
    if (!data?.token || data.token !== clean) {
      return null;
    }
    if (Date.now() > data.expiresAt) {
      await fs.unlink(previewPath(clean)).catch(() => undefined);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function packagePreviewUrl(slug: string, token: string) {
  return `/packages/${slug}?preview=${token}`;
}

export function categoryPreviewUrl(slug: string, token: string) {
  return `/package-category/${slug}?preview=${token}`;
}
