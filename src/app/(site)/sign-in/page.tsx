export const metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-navy/70">
        Accounts are created by Prime Box Printing after your quote is approved.
      </p>
      <form className="mt-8 grid gap-4" action="/account">
        <label className="grid gap-1 text-sm">
          Username
          <input required name="username" className="rounded border border-navy/20 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input required type="password" name="password" className="rounded border border-navy/20 px-3 py-2" />
        </label>
        <button type="submit" className="rounded bg-yellow px-5 py-2 font-semibold text-navy">
          Sign In
        </button>
      </form>
    </div>
  );
}
