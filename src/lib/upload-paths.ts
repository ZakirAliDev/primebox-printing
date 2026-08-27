import path from "node:path";
import { promises as fs } from "node:fs";

/**
 * Upload root that survives Hostinger redeploys.
 * - UPLOADS_DIR env wins when set
 * - production: ../persistent-uploads (sibling of the app dir Hostinger replaces)
 * - local/dev: public/uploads (Next static + easy inspection)
 */
export function uploadsRoot(): string {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured) {
    return path.resolve(configured);
  }
  if (process.env.NODE_ENV === "production") {
    return path.resolve(process.cwd(), "..", "persistent-uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

/** Absolute path for a public URL like /uploads/categories/foo/bar.webp */
export function absoluteUploadPath(publicUrlOrRelative: string): string {
  const cleaned = publicUrlOrRelative.replace(/^\/+/, "").replace(/^uploads\//, "");
  return path.join(uploadsRoot(), cleaned);
}

/** Absolute dir for categories/{slug} or products/{slug} */
export function uploadSubdir(...parts: string[]): string {
  return path.join(uploadsRoot(), ...parts);
}

/** Git-committed fallback under public/uploads (survives only if tracked in repo). */
export function bundledUploadPath(publicUrlOrRelative: string): string {
  const cleaned = publicUrlOrRelative.replace(/^\/+/, "").replace(/^uploads\//, "");
  return path.join(process.cwd(), "public", "uploads", cleaned);
}

export async function resolveReadableUpload(publicUrlOrRelative: string): Promise<string | null> {
  const primary = absoluteUploadPath(publicUrlOrRelative);
  try {
    await fs.access(primary);
    return primary;
  } catch {
    // fall through
  }
  const bundled = bundledUploadPath(publicUrlOrRelative);
  try {
    await fs.access(bundled);
    return bundled;
  } catch {
    return null;
  }
}

async function copyMissingTree(fromDir: string, toDir: string) {
  let entries;
  try {
    entries = await fs.readdir(fromDir, { withFileTypes: true });
  } catch {
    return;
  }
  await fs.mkdir(toDir, { recursive: true });
  for (const entry of entries) {
    const from = path.join(fromDir, entry.name);
    const to = path.join(toDir, entry.name);
    if (entry.isDirectory()) {
      await copyMissingTree(from, to);
      continue;
    }
    try {
      await fs.access(to);
    } catch {
      await fs.copyFile(from, to);
    }
  }
}

/**
 * Boot: copy any files still under public/uploads into the persistent root
 * so a later Hostinger redeploy does not lose them.
 */
export async function ensurePersistentUploads(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const root = uploadsRoot();
  const bundled = path.join(process.cwd(), "public", "uploads");
  if (path.resolve(root) === path.resolve(bundled)) {
    return;
  }
  await fs.mkdir(root, { recursive: true });
  await copyMissingTree(bundled, root);
}
