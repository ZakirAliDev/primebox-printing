import Link from "next/link";
import type { ReactNode } from "react";
import type { CategoryPaginationStyle } from "@/lib/catalog";

export function categoryPageHref(slug: string, page: number) {
  if (page <= 1) {
    return `/package-category/${slug}`;
  }
  return `/package-category/${slug}?page=${page}`;
}

const linkClass =
  "inline-flex min-w-9 items-center justify-center rounded border border-navy/15 px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow";

const activeLinkClass = "border-yellow bg-yellow/15 font-semibold";

function PaginationShell({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="Product pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {children}
    </nav>
  );
}

function NumberedPagination({
  slug,
  currentPage,
  totalPages,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <PaginationShell>
      {currentPage > 1 ? (
        <Link href={categoryPageHref(slug, currentPage - 1)} className={linkClass}>
          Previous
        </Link>
      ) : null}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
        const active = page === currentPage;
        return (
          <Link
            key={page}
            href={categoryPageHref(slug, page)}
            aria-current={active ? "page" : undefined}
            className={`${linkClass} ${active ? activeLinkClass : ""}`}
          >
            {page}
          </Link>
        );
      })}
      {currentPage < totalPages ? (
        <Link href={categoryPageHref(slug, currentPage + 1)} className={linkClass}>
          Next
        </Link>
      ) : null}
    </PaginationShell>
  );
}

function PrevNextPagination({
  slug,
  currentPage,
  totalPages,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <PaginationShell>
      {currentPage > 1 ? (
        <Link href={categoryPageHref(slug, currentPage - 1)} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={`${linkClass} cursor-not-allowed opacity-40`} aria-disabled="true">
          Previous
        </span>
      )}
      {currentPage < totalPages ? (
        <Link href={categoryPageHref(slug, currentPage + 1)} className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={`${linkClass} cursor-not-allowed opacity-40`} aria-disabled="true">
          Next
        </span>
      )}
    </PaginationShell>
  );
}

function CompactPagination({
  slug,
  currentPage,
  totalPages,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <PaginationShell>
      {currentPage > 1 ? (
        <Link href={categoryPageHref(slug, currentPage - 1)} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={`${linkClass} cursor-not-allowed opacity-40`} aria-disabled="true">
          Previous
        </span>
      )}
      <span className="px-2 text-sm text-muted" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={categoryPageHref(slug, currentPage + 1)} className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={`${linkClass} cursor-not-allowed opacity-40`} aria-disabled="true">
          Next
        </span>
      )}
    </PaginationShell>
  );
}

export function CategoryPagination({
  slug,
  currentPage,
  totalPages,
  style,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
  style: CategoryPaginationStyle;
}) {
  if (totalPages <= 1 || style === "load-more") {
    return null;
  }

  switch (style) {
    case "prev-next":
      return <PrevNextPagination slug={slug} currentPage={currentPage} totalPages={totalPages} />;
    case "compact":
      return <CompactPagination slug={slug} currentPage={currentPage} totalPages={totalPages} />;
    default:
      return <NumberedPagination slug={slug} currentPage={currentPage} totalPages={totalPages} />;
  }
}
