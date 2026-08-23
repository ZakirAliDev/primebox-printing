import { isAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/catalog";
import { saveProductImage } from "@/lib/product-media";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const slug = slugify(String(data.get("slug") ?? "draft")) || "draft";
  const file = data.get("file");
  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  try {
    const url = await saveProductImage(slug, file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
