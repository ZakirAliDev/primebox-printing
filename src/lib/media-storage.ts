import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";

/** Prefer Blob whenever a token exists (Vercel prod + local with env pull). */
export function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function storeUploadBytes(options: {
  pathname: string;
  bytes: Uint8Array | Buffer;
  contentType?: string;
  localAbsolutePath: string;
  localPublicUrl: string;
}): Promise<string> {
  if (useBlobStorage()) {
    const body = Buffer.isBuffer(options.bytes) ? options.bytes : Buffer.from(options.bytes);
    const blob = await put(options.pathname, body, {
      access: "public",
      contentType: options.contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Image uploads need Vercel Blob. Create a Blob store in the Vercel project (Storage → Blob) so BLOB_READ_WRITE_TOKEN is set.",
    );
  }

  await fs.mkdir(path.dirname(options.localAbsolutePath), { recursive: true });
  await fs.writeFile(options.localAbsolutePath, options.bytes);
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
