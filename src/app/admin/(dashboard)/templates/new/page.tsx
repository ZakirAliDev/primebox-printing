import { TemplateForm } from "@/components/admin/TemplateForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Add New Template" };

export default async function NewTemplatePage() {
  await requireAdmin();
  return (
    <div>
      <TemplateForm />
    </div>
  );
}
