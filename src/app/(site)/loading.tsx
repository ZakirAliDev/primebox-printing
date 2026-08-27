export default function SiteLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-12">
      <div className="mx-auto h-10 max-w-2xl rounded-lg bg-navy/10" />
      <div className="mt-4 mx-auto h-4 max-w-xl rounded bg-navy/[0.06]" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="h-48 rounded-xl bg-navy/[0.06]" />
        <div className="h-48 rounded-xl bg-navy/[0.06]" />
        <div className="h-48 rounded-xl bg-navy/[0.06]" />
        <div className="h-48 rounded-xl bg-navy/[0.06]" />
      </div>
    </div>
  );
}
