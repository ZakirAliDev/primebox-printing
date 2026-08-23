import { TagForm } from "@/components/admin/TagForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Add New Tag" };

export default async function NewTagPage() {
  await requireAdmin();
  return (
    <div>
      <TagForm />
    </div>
  );
}
