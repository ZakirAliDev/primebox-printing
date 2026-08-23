import type { MetadataRoute } from "next";
import { readCatalog } from "@/lib/catalog-store";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/quote", "/about-us", "/contact-us", "/faqs"].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: new Date(),
  }));

  const { categories: allCategories, packages: allPackages } = await readCatalog();

  const categories = allCategories.map((item) => ({
    url: `${SITE_URL}/package-category/${item.slug}`,
    lastModified: new Date(),
  }));

  const packages = allPackages.map((item) => ({
    url: `${SITE_URL}/packages/${item.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categories, ...packages];
}
