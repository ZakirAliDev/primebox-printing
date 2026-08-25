export default function SiteLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10" aria-hidden="true">
      <div className="h-10 w-2/3 rounded bg-navy/10" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-navy/5" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="aspect-[4/3] rounded-lg bg-navy/5" />
        <div className="aspect-[4/3] rounded-lg bg-navy/5" />
        <div className="aspect-[4/3] rounded-lg bg-navy/5" />
      </div>
    </div>
  );
}
