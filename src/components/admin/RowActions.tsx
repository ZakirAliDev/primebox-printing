export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100">
      <div className="min-h-0 overflow-hidden">
        <p className="flex gap-2 pt-1 text-xs">{children}</p>
      </div>
    </div>
  );
}
