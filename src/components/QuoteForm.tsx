import {
  siteField,
  siteFieldLabel,
  siteFieldRowPair,
  siteFieldRowQuad,
  siteFieldRowTriple,
  siteFormEmbedded,
  siteFormStandalone,
  siteFormTitle,
  siteSelect,
  siteTextarea,
  siteSubmit,
} from "@/components/form-ui";
import { SiteSelect } from "@/components/SiteSelect";
import { submitQuote } from "@/app/(site)/actions";
import { ADDONS, BOX_STYLES, UNITS } from "@/lib/site";

const HOME_COMMENT_PLACEHOLDER =
  "Please provide the detailed packaging specifications including dimensions, materials, weight, and design references. Our packaging specialist will review the information and promptly provide you with a competitive quote.";

type QuoteFormProps = {
  compact?: boolean;
  embedded?: boolean;
  returnTo?: string;
  hideTitle?: boolean;
};

export function QuoteForm({
  compact = false,
  embedded = false,
  returnTo = "/quote",
  hideTitle = false,
}: QuoteFormProps) {
  return (
    <form action={submitQuote} className={embedded ? siteFormEmbedded : siteFormStandalone}>
      <input type="hidden" name="returnTo" value={returnTo} />
      {hideTitle ? null : <h5 className={siteFormTitle}>Request your quote in a few simple steps</h5>}
      {compact ? (
        <>
          <div className={siteFieldRowTriple}>
            <label className={siteFieldLabel}>
              Name *
              <input required name="name" className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Email *
              <input required type="email" name="email" className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Phone
              <input type="tel" name="phone" className={siteField} />
            </label>
          </div>
          <div className={siteFieldRowTriple}>
            <label className={siteFieldLabel}>
              Size *
              <input required name="size" className={siteField} />
            </label>
            <label className={siteFieldLabel}>
              Unit
              <select name="unit" className={siteSelect} defaultValue="">
                <option value="">—Please choose an option—</option>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label className={siteFieldLabel}>
              Quantity *
              <input required name="quantity" type="number" min={1} className={siteField} />
            </label>
          </div>
          <label className={siteFieldLabel}>
            Choose File (Allowed file types to upload AI, PDF, EPS, TIFF)
            <input
              type="file"
              name="artwork"
              accept=".ai,.pdf,.eps,.tiff,.tif,.jpg,.jpeg,.png,.gif"
              className={`${siteField} h-auto py-2 file:mr-3 file:rounded file:border-0 file:bg-navy/5 file:px-3 file:py-1 file:text-sm file:font-medium file:text-navy`}
            />
          </label>
        </>
      ) : (
        <>
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
      )}
      <label className={siteFieldLabel}>
        Comment *:
        <textarea
          required
          name="comment"
          rows={4}
          placeholder={compact ? HOME_COMMENT_PLACEHOLDER : "Dimensions, materials, weight, and design references."}
          className={siteTextarea}
        />
      </label>
      <button type="submit" className={siteSubmit}>
        Submit
      </button>
    </form>
  );
}
