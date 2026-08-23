import { redirect } from "next/navigation";

export default function LegacyNewCategoryRedirect() {
  redirect("/admin/products/categories/new");
}
