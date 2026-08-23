import { redirect } from "next/navigation";
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

export async function submitContact(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/contact-us");

  if (!name || !email) {
    redirect(returnTo.includes("?") ? `${returnTo}&error=1` : `${returnTo}?error=1`);
  }

  redirect(returnTo.includes("?") ? `${returnTo}&sent=1` : `${returnTo}?sent=1`);
}

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
      <h2 className={siteFormTitle}>Leave your details. Our experts will approach you soon.</h2>
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
