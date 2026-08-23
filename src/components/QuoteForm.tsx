import { redirect } from "next/navigation";
import {
  siteField,
  siteFieldLabel,
  siteFieldRowPair,
  siteFieldRowQuad,
  siteFormEmbedded,
  siteFormStandalone,
  siteFormTitle,
  siteTextarea,
  siteSubmit,
} from "@/components/form-ui";
import { SiteSelect } from "@/components/SiteSelect";
import { ADDONS, BOX_STYLES, UNITS } from "@/lib/site";

export async function submitQuote(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/quote");

  if (!name || !email || !comment) {
    const errorPath = returnTo.includes("?") ? `${returnTo}&error=1` : `${returnTo}?error=1`;
    redirect(errorPath);
  }

  const sentPath = returnTo.includes("?") ? `${returnTo}&sent=1` : `${returnTo}?sent=1`;
  redirect(sentPath);
}

type QuoteFormProps = {
  compact?: boolean;
  embedded?: boolean;
  returnTo?: string;
};

export function QuoteForm({ compact = false, embedded = false, returnTo = "/quote" }: QuoteFormProps) {
  return (
    <form action={submitQuote} className={embedded ? siteFormEmbedded : siteFormStandalone}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <h2 className={siteFormTitle}>Request your quote in a few simple steps</h2>
      <div className={siteFieldRowPair}>
        <label className={siteFieldLabel}>
          Name *
          <input required name="name" className={siteField} />
        </label>
        <label className={siteFieldLabel}>
          Email *
          <input required type="email" name="email" className={siteField} />
        </label>
      </div>
      <div className={siteFieldRowPair}>
        <label className={siteFieldLabel}>
          Phone
          <input type="tel" name="phone" className={siteField} />
        </label>
        <label className={siteFieldLabel}>
          Box style
          <SiteSelect name="boxStyle">
            {BOX_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </SiteSelect>
        </label>
      </div>
      {!compact ? (
        <>
          <div className={siteFieldRowQuad}>
            <label className={siteFieldLabel}>
              Length *
              <input required name="length" type="number" min={0} step="0.01" className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Width *
              <input required name="width" type="number" min={0} step="0.01" className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Height *
              <input required name="height" type="number" min={0} step="0.01" className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Unit *
              <SiteSelect required name="unit">
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </SiteSelect>
            </label>
          </div>
          <div className={siteFieldRowQuad}>
            <label className={siteFieldLabel}>
              Quantity 1 *
              <input required name="quantity1" type="number" min={100} className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Quantity 2
              <input name="quantity2" type="number" min={0} className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Quantity 3
              <input name="quantity3" type="number" min={0} className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Add-ons
              <SiteSelect name="addon">
                {ADDONS.map((addon) => (
                  <option key={addon} value={addon}>
                    {addon}
                  </option>
                ))}
              </SiteSelect>
            </label>
          </div>
        </>
      ) : null}
      <label className={siteFieldLabel}>
        Comment *
        <textarea
          required
          name="comment"
          rows={4}
          placeholder="Dimensions, materials, weight, and design references."
          className={siteTextarea}
        />
      </label>
      <button type="submit" className={siteSubmit}>
        Submit
      </button>
    </form>
  );
}
