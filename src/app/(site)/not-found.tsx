import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-navy/70">That URL is not on the new Prime Box Printing site yet.</p>
      <Link href="/" className="mt-6 inline-block rounded bg-yellow px-5 py-2 font-semibold text-navy">
        Back to home
      </Link>
    </div>
  );
}
