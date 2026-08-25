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

export async function saveProductImageBytes(slug: string, bytes: Uint8Array, filename: string) {
  const ext = extensionFromName(filename);
  if (!ext) {
    throw new Error("Use JPG, PNG, WebP, GIF, SVG, or ICO images.");
  }
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error("Each image must be 5MB or smaller.");
  }
  const dir = uploadDir(slug);
  await fs.mkdir(dir, { recursive: true });
  const saved = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await fs.writeFile(path.join(dir, saved), bytes);
  return `/uploads/products/${slug}/${saved}`;
}

function extensionFromName(name: string) {
  const lower = name.toLowerCase().split("?")[0];
  const dot = lower.lastIndexOf(".");
  if (dot === -1) {
    return undefined;
  }
  return ALLOWED_EXTENSIONS.get(lower.slice(dot + 1));
}

export async function saveRemoteProductImage(slug: string, url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Image URL must start with http or https.");
  }
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Could not download image (${response.status}).`);
  }
  const buffer = new Uint8Array(await response.arrayBuffer());
  const fromUrl = parsed.pathname.split("/").pop() || "image.jpg";
  const contentType = response.headers.get("content-type") ?? "";
  const typeExt = ALLOWED_TYPES.get(contentType.split(";")[0].trim());
  const filename = typeExt && !extensionFromName(fromUrl) ? `image.${typeExt}` : fromUrl;
  return saveProductImageBytes(slug, buffer, filename);
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
