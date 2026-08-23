import { QuoteForm } from "@/components/QuoteForm";
import { CONTACT } from "@/lib/site";

type QuotePageProps = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export const metadata = {
  title: "Get a Free Custom Packaging Quote",
  description:
    "Request a free quote for custom boxes, Mylar bags, and packaging. We reply within 24 hours.",
};

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-semibold">Get a custom packaging quote</h1>
        <p className="mt-4 text-navy/70">
          Share dimensions, quantity, and artwork notes. A specialist replies within 24 hours.
          Payment is only requested after you approve digital proofs.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>
            Call{" "}
            <a className="font-medium" href={`tel:${CONTACT.phoneUsTel}`}>
              {CONTACT.phoneUs}
            </a>
          </li>
          <li>
            Email{" "}
            <a className="font-medium" href={`mailto:${CONTACT.salesEmail}`}>
              {CONTACT.salesEmail}
            </a>
          </li>
        </ul>
      </div>
      <div>
        {params.sent ? (
          <p className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm">
            Quote request received. We will contact you shortly.
          </p>
        ) : null}
        {params.error ? (
          <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm">
            Please fill in name, email, and comment.
          </p>
        ) : null}
        <QuoteForm />
      </div>
    </div>
  );
}
