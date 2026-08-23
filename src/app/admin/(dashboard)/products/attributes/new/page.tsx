import { AttributeForm } from "@/components/admin/AttributeForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Add New Attribute" };

export default async function NewAttributePage() {
  await requireAdmin();
  return (
    <div>
      <AttributeForm />
    </div>
  );
}
