import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveReadableUpload, uploadsRoot } from "@/lib/upload-paths";

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

function safeJoin(root: string, segments: string[]): string | null {
  const resolved = path.resolve(root, ...segments);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return resolved;
}

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

  const relative = segments.join("/");
  const filePath = await resolveReadableUpload(relative);
  if (!filePath) {
    // Also try direct join under uploadsRoot for clarity in logs
    const candidate = safeJoin(uploadsRoot(), segments);
    if (!candidate) {
      return new NextResponse("Not found", { status: 404 });
    }
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
