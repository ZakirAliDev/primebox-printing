"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 2000;

export function AdminNotice({
  created,
  updated,
  deleted,
  noun,
}: {
  created?: string;
  updated?: string;
  deleted?: string;
  noun: string;
}) {
  const text = created
    ? `${noun} published.`
    : updated
      ? `${noun} updated.`
      : deleted
        ? `${noun} moved to trash.`
        : null;

  return <AdminToast notice={text ? { id: text, text } : null} />;
}

export function AdminToast({ notice }: { notice: { id: number | string; text: string } | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notice) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const hide = window.setTimeout(() => {
      setVisible(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      url.searchParams.delete("updated");
      url.searchParams.delete("deleted");
      const query = url.searchParams.toString();
      window.history.replaceState(null, "", `${url.pathname}${query ? `?${query}` : ""}`);
    }, DURATION_MS);
    return () => window.clearTimeout(hide);
  }, [notice]);

  if (!notice || !visible) {
    return null;
  }

  return (
    <div
      className="admin-toast pointer-events-none fixed top-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-navy/10 bg-white shadow-lg"
      role="status"
    >
      <p className="px-4 py-3 text-sm font-medium text-navy">{notice.text}</p>
      <div className="h-1 bg-navy/10">
        <div className="admin-toast-bar h-full bg-yellow" />
      </div>
    </div>
  );
}
