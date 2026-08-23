import { loginAction } from "@/app/admin/actions";
import { isAdmin } from "@/lib/admin-auth";
import { SITE_NAME } from "@/lib/site";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Log In",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdmin()) {
    redirect("/admin");
  }
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy">
      <div className="w-full max-w-[360px] px-4">
        <div className="mb-8 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow">{SITE_NAME}</p>
          <h1 className="mt-2 text-2xl font-semibold">Admin sign in</h1>
        </div>
        {error ? (
          <p className="mb-4 rounded border-l-4 border-yellow bg-white px-3 py-2 text-sm text-navy">
            The password you entered is incorrect.
          </p>
        ) : null}
        <form action={loginAction} className="rounded-xl bg-white p-6 shadow-lg">
          <label className="grid gap-1 text-sm text-navy">
            Password
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              className="rounded border border-navy/20 px-3 py-2 outline-none focus:border-navy"
            />
          </label>
          <button
            type="submit"
            className="mt-4 w-full rounded bg-yellow py-2.5 text-sm font-semibold text-navy"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
