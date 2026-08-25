import { promises as fs } from "node:fs";
import path from "node:path";

/** Hostinger (and local): store uploads on disk under public/. */
export async function storeUploadBytes(options: {
  pathname: string;
  bytes: Uint8Array | Buffer;
  contentType?: string;
  localAbsolutePath: string;
  localPublicUrl: string;
}): Promise<string> {
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
