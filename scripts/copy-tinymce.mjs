import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "public/tinymce");

mkdirSync(dest, { recursive: true });
cpSync(join(root, "node_modules/tinymce"), dest, { recursive: true });
