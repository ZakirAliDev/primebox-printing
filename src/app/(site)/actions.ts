"use server";

import { redirect } from "next/navigation";

export async function submitQuote(formData: FormData) {
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

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/contact-us");

  if (!name || !email) {
    redirect(returnTo.includes("?") ? `${returnTo}&error=1` : `${returnTo}?error=1`);
  }

  redirect(returnTo.includes("?") ? `${returnTo}&sent=1` : `${returnTo}?sent=1`);
}
