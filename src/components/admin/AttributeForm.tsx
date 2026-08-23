import { deleteAttributeAction, saveAttributeAction } from "@/app/admin/actions";
import { AdminPublishActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { TitlePermalink } from "@/components/admin/TitlePermalink";
import { adminBox, adminBoxHead, adminField, adminMuted, adminTrashOnDark } from "@/components/admin/ui";
import type { ProductAttribute } from "@/lib/catalog";

export function AttributeForm({ attribute }: { attribute?: ProductAttribute }) {
  const isNew = !attribute;

  return (
    <form id="attribute-save" action={saveAttributeAction} className="space-y-4">
      {attribute ? <input type="hidden" name="originalSlug" value={attribute.slug} /> : null}
      <AdminPublishActions
        isNew={isNew}
        formId="attribute-save"
        trash={
          attribute ? (
            <form action={deleteAttributeAction}>
              <input type="hidden" name="slug" value={attribute.slug} />
              <ConfirmSubmit
                label="Move to Trash"
                message={`Move “${attribute.name}” to trash?`}
                className={adminTrashOnDark}
              />
            </form>
          ) : null
        }
      />
      <TitlePermalink defaultName={attribute?.name} defaultSlug={attribute?.slug} prefix="/attribute/" />
      <div className={adminBox}>
        <h2 className={adminBoxHead}>Terms</h2>
        <div className="p-3">
          <textarea
            name="terms"
            rows={8}
            defaultValue={attribute?.terms.join("\n")}
            className={adminField}
            placeholder={"One term per line\ne.g. Kraft\nWhite\nCustom print"}
          />
          <p className={`mt-1 text-xs ${adminMuted}`}>One term per line.</p>
        </div>
      </div>
    </form>
  );
}
