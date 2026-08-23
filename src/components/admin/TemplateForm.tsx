import { deleteTabTemplateAction, saveTabTemplateAction } from "@/app/admin/actions";
import { AdminPublishActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { TemplateLayoutBuilder } from "@/components/admin/TemplateLayoutBuilder";
import { TitlePermalink } from "@/components/admin/TitlePermalink";
import { adminMuted, adminTrashOnDark } from "@/components/admin/ui";
import type { TabTemplate } from "@/lib/catalog";

export function TemplateForm({ template }: { template?: TabTemplate }) {
  const isNew = !template;

  return (
    <>
      <AdminPublishActions
        isNew={isNew}
        formId="template-save"
        trash={
          template ? (
            <form action={deleteTabTemplateAction}>
              <input type="hidden" name="slug" value={template.slug} />
              <ConfirmSubmit
                label="Move to Trash"
                message={`Move “${template.name}” to trash?`}
                className={adminTrashOnDark}
              />
            </form>
          ) : null
        }
      />
      <form id="template-save" action={saveTabTemplateAction} className="space-y-4">
        {template ? <input type="hidden" name="originalSlug" value={template.slug} /> : null}
        <TitlePermalink defaultName={template?.name} defaultSlug={template?.slug} prefix="/templates/" />
        <TemplateLayoutBuilder
          defaultLayout={template?.layout}
          mediaSlug={template ? `templates/${template.slug}` : "templates/draft"}
        />
        <p className={`text-xs ${adminMuted}`}>
          Add a section (row), choose columns, then drag widgets from the left. Products can attach this template as a
          tab.
        </p>
      </form>
    </>
  );
}
