import { promises as fs } from "node:fs";
import path from "node:path";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
  ["image/x-icon", "ico"],
  ["image/vnd.microsoft.icon", "ico"],
]);
const ALLOWED_EXTENSIONS = new Map([
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["png", "png"],
  ["webp", "webp"],
  ["gif", "gif"],
  ["svg", "svg"],
  ["ico", "ico"],
]);
const MAX_BYTES = 5 * 1024 * 1024;

function uploadDir(slug: string) {
  return path.join(process.cwd(), "public/uploads/products", slug);
}

function extensionFor(file: File) {
  const fromType = ALLOWED_TYPES.get(file.type);
  if (fromType) {
    return fromType;
  }
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot === -1) {
    return undefined;
  }
  return ALLOWED_EXTENSIONS.get(name.slice(dot + 1));
}

export async function saveProductImage(slug: string, file: File) {
  if (!file.size) {
    return "";
  }
  const ext = extensionFor(file);
  if (!ext) {
    throw new Error("Use JPG, PNG, WebP, GIF, SVG, or ICO images.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each image must be 5MB or smaller.");
  }
  const dir = uploadDir(slug);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/products/${slug}/${filename}`;
}

export async function saveProductImages(slug: string, files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    const url = await saveProductImage(slug, file);
    if (url) {
      urls.push(url);
    }
  }
  return urls;
}

export async function deleteProductUploads(slug: string) {
  await fs.rm(uploadDir(slug), { recursive: true, force: true });
}
