import { promises as fs } from "node:fs";
import path from "node:path";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";

function mediaPathKey(pathname: string): string {
  return pathname.replace(/^\/+/, "");
}

async function upsertMediaAsset(pathname: string, bytes: Buffer, contentType?: string) {
  if (!isDatabaseConfigured()) {
    return;
  }
  const prisma = getPrisma();
  const key = mediaPathKey(pathname);
  const type = contentType?.trim() || "application/octet-stream";
  await prisma.mediaAsset.upsert({
    where: { path: key },
    create: { path: key, contentType: type, data: bytes },
    update: { contentType: type, data: bytes },
  });
}

export async function readMediaAsset(
  pathname: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }
  try {
    const row = await getPrisma().mediaAsset.findUnique({
      where: { path: mediaPathKey(pathname) },
    });
    if (!row) {
      return null;
    }
    return {
      bytes: Buffer.from(row.data),
      contentType: row.contentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

/** Write to MySQL (source of truth) and best-effort disk cache. */
export async function storeUploadBytes(options: {
  pathname: string;
  bytes: Uint8Array | Buffer;
  contentType?: string;
  localAbsolutePath: string;
  localPublicUrl: string;
}): Promise<string> {
  const buffer = Buffer.from(options.bytes);
  await upsertMediaAsset(options.pathname, buffer, options.contentType);

  try {
    await fs.mkdir(path.dirname(options.localAbsolutePath), { recursive: true });
    await fs.writeFile(options.localAbsolutePath, buffer);
  } catch (error) {
    console.warn("Disk upload cache failed (MySQL copy kept):", error);
  }

  return options.localPublicUrl;
}

export async function storeUploadFile(options: {
  pathname: string;
  file: File;
  localAbsolutePath: string;
  localPublicUrl: string;
}): Promise<string> {
  const bytes = Buffer.from(await options.file.arrayBuffer());
  return storeUploadBytes({
    pathname: options.pathname,
    bytes,
    contentType: options.file.type || undefined,
    localAbsolutePath: options.localAbsolutePath,
    localPublicUrl: options.localPublicUrl,
  });
}
