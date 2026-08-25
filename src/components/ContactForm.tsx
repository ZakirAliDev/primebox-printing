import {
  siteField,
  siteFieldLabel,
  siteFieldRow,
  siteFieldRowEmbedded,
  siteFormEmbedded,
  siteFormStandalone,
  siteFormTitle,
  siteTextarea,
  siteSubmit,
} from "@/components/form-ui";
import { submitContact } from "@/app/(site)/actions";

export function ContactForm({
  embedded = false,
  returnTo = "/contact-us",
}: {
  embedded?: boolean;
  returnTo?: string;
}) {
  return (
    <form action={submitContact} className={embedded ? siteFormEmbedded : siteFormStandalone}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <h5 className={siteFormTitle}>Leave your details. Our experts will approach you soon.</h5>
      <div className={embedded ? siteFieldRowEmbedded : siteFieldRow}>
        <label className={siteFieldLabel}>
          Your name *
          <input required name="name" className={siteField} />
        </label>
        <label className={siteFieldLabel}>
          Your email *
          <input required type="email" name="email" className={siteField} />
        </label>
      </div>
      <label className={siteFieldLabel}>
        Contact number
        <input type="tel" name="phone" className={siteField} />
      </label>
      <label className={siteFieldLabel}>
        Subject
        <input name="subject" className={siteField} />
      </label>
      <label className={siteFieldLabel}>
        Message
        <textarea name="message" rows={4} className={siteTextarea} />
      </label>
      <button type="submit" className={siteSubmit}>
        Submit
      </button>
    </form>
  );
}
