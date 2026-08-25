import path from "node:path";
import { promises as fs } from "node:fs";
import { storeUploadFile } from "@/lib/media-storage";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);
const ALLOWED_EXTENSIONS = new Map([
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["png", "png"],
  ["webp", "webp"],
  ["gif", "gif"],
  ["svg", "svg"],
]);
const MAX_BYTES = 5 * 1024 * 1024;

function uploadDir(slug: string) {
  return path.join(process.cwd(), "public/uploads/categories", slug);
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

export async function saveCategoryImage(slug: string, file: File) {
  if (!file.size) {
    return "";
  }
  const ext = extensionFor(file);
  if (!ext) {
    throw new Error("Use JPG, PNG, WebP, GIF, or SVG images.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each image must be 5MB or smaller.");
  }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const pathname = `uploads/categories/${slug}/${filename}`;
  return storeUploadFile({
    pathname,
    file,
    localAbsolutePath: path.join(uploadDir(slug), filename),
    localPublicUrl: `/${pathname}`,
  });
}

export async function deleteCategoryUploads(slug: string) {
  await fs.rm(uploadDir(slug), { recursive: true, force: true });
}
