import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { AdminMenu } from "@/components/admin/AdminMenu";
import { AdminPageBar, AdminPageBarProvider } from "@/components/admin/AdminPageBar";
import { getCatalogSource } from "@/lib/catalog-db";
import { isDatabaseConfigured } from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const storageMode = getCatalogSource();
  const productionWithoutDb = process.env.NODE_ENV === "production" && !isDatabaseConfigured();

  return (
    <div className="flex h-screen overflow-hidden bg-navy/[0.04] font-sans text-sm text-navy">
      <div className="relative z-[60] flex shrink-0 py-3 pl-3">
        <aside className="flex w-[200px] flex-col overflow-visible rounded-2xl bg-navy text-white shadow-sm">
          <Link href="/admin" className="border-b border-white/10 px-4 py-4">
            <span className="block text-[15px] font-semibold tracking-wide">{SITE_NAME.toUpperCase()}</span>
            <span className="text-[11px] font-normal text-white/60">
              Admin · {storageMode === "database" ? "MySQL" : "file"}
            </span>
          </Link>
          <AdminMenu />
          <div className="mt-auto space-y-1 border-t border-white/10 p-3 text-[13px]">
            <Link href="/" className="block rounded px-2 py-1.5 text-white/70 hover:bg-white/10 hover:text-white">
              Visit site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded bg-yellow px-2 py-1.5 text-left font-semibold text-navy"
              >
                Log Out
              </button>
            </form>
          </div>
        </aside>
      </div>
      <AdminPageBarProvider>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 py-3 pr-6 pl-3">
          <AdminPageBar />
          {productionWithoutDb ? (
            <div
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-950"
              role="status"
            >
              MySQL is not configured. Set <strong>DB_USER</strong>, <strong>DB_PASSWORD</strong>,{" "}
              <strong>DB_NAME</strong> (and optional <strong>DB_HOST</strong>) on Hostinger. See{" "}
              <code className="text-xs">.env.example</code>.
            </div>
          ) : null}
          {storageMode === "file" ? (
            <div
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-950"
              role="status"
            >
              Catalog is reading from <strong>catalog.json</strong> (not MySQL). Admin edits will not match the
              live storefront until database env vars are set.
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </div>
      </AdminPageBarProvider>
    </div>
  );
}
