import Link from "next/link";
import { readCatalog } from "@/lib/catalog-store";
import { plainTextFromHtml } from "@/lib/rich-text";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query
    ? (await readCatalog()).packages.filter((item) => {
        const haystack =
          `${item.name} ${plainTextFromHtml(item.summary)} ${plainTextFromHtml(item.body)}`.toLowerCase();
        return haystack.includes(query);
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Search</h1>
      {query ? (
        <p className="mt-2 text-navy/70">Results for “{q}”</p>
      ) : (
        <p className="mt-2 text-navy/70">Enter a package name to search.</p>
      )}
      <ul className="mt-8 space-y-4">
        {results.map((item) => (
          <li key={item.slug}>
            <Link href={`/packages/${item.slug}`} className="font-semibold text-navy">
              {item.name}
            </Link>
            <p className="text-sm text-navy/70">{plainTextFromHtml(item.summary)}</p>
          </li>
        ))}
      </ul>
      {query && results.length === 0 ? (
        <p className="mt-6 text-navy/70">No packages matched that search.</p>
      ) : null}
    </div>
  );
}
