import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ensureDatabaseSchema } from "@/lib/db";
import { readMediaAsset } from "@/lib/media-storage";
import { resolveReadableUpload } from "@/lib/upload-paths";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (segments.some((part) => part === ".." || part.includes("\0"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const relative = `uploads/${segments.join("/")}`;

  try {
    await ensureDatabaseSchema();
  } catch {
    // Still try disk / bundled below.
  }

  const fromDb = await readMediaAsset(relative);
  if (fromDb) {
    return new NextResponse(new Uint8Array(fromDb.bytes), {
      status: 200,
      headers: {
        "Content-Type": fromDb.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Media-Source": "database",
      },
    });
  }

  const filePath = await resolveReadableUpload(relative);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  // Backfill MySQL so the next redeploy still has this file.
  try {
    const { storeUploadBytes } = await import("@/lib/media-storage");
    await storeUploadBytes({
      pathname: relative,
      bytes,
      contentType,
      localAbsolutePath: filePath,
      localPublicUrl: `/${relative}`,
    });
  } catch {
    // ignore backfill errors
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Media-Source": "disk",
    },
  });
}
