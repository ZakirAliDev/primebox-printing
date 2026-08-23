import { deleteTagAction, saveTagAction } from "@/app/admin/actions";
import { AdminPublishActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { TitlePermalink } from "@/components/admin/TitlePermalink";
import { adminBox, adminBoxHead, adminField, adminTrashOnDark } from "@/components/admin/ui";
import type { Tag } from "@/lib/catalog";

export function TagForm({ tag }: { tag?: Tag }) {
  const isNew = !tag;

  return (
    <form id="tag-save" action={saveTagAction} className="space-y-4">
      {tag ? <input type="hidden" name="originalSlug" value={tag.slug} /> : null}
      <AdminPublishActions
        isNew={isNew}
        formId="tag-save"
        trash={
          tag ? (
            <form action={deleteTagAction}>
              <input type="hidden" name="slug" value={tag.slug} />
              <ConfirmSubmit
                label="Move to Trash"
                message={`Move “${tag.name}” to trash?`}
                className={adminTrashOnDark}
              />
            </form>
          ) : null
        }
      />
      <TitlePermalink defaultName={tag?.name} defaultSlug={tag?.slug} prefix="/tag/" />
      <div className={adminBox}>
        <h2 className={adminBoxHead}>Description</h2>
        <div className="p-3">
          <textarea name="summary" rows={6} defaultValue={tag?.summary} className={adminField} />
        </div>
      </div>
    </form>
  );
}
