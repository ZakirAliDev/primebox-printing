"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 2000;
const ERROR_DURATION_MS = 8000;

export function AdminNotice({
  created,
  updated,
  deleted,
  error,
  noun,
}: {
  created?: string;
  updated?: string;
  deleted?: string;
  error?: string;
  noun: string;
}) {
  const text = error
    ? error
    : created
      ? `${noun} published.`
      : updated
        ? `${noun} updated.`
        : deleted
          ? `${noun} moved to trash.`
          : null;
  const tone = error ? "error" : "ok";

  return <AdminToast notice={text ? { id: `${tone}:${text}`, text, tone } : null} />;
}

export function AdminToast({
  notice,
}: {
  notice: { id: number | string; text: string; tone?: "ok" | "error" } | null;
}) {
  const [visible, setVisible] = useState(false);
  const isError = notice?.tone === "error";

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
      url.searchParams.delete("error");
      const query = url.searchParams.toString();
      window.history.replaceState(null, "", `${url.pathname}${query ? `?${query}` : ""}`);
    }, isError ? ERROR_DURATION_MS : DURATION_MS);
    return () => window.clearTimeout(hide);
  }, [notice, isError]);

  if (!notice || !visible) {
    return null;
  }

  return (
    <div
      className={`admin-toast pointer-events-none fixed top-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border shadow-lg ${
        isError ? "border-red-200 bg-white" : "border-navy/10 bg-white"
      }`}
      role="status"
    >
      <p className={`px-4 py-3 text-sm font-medium ${isError ? "text-red-800" : "text-navy"}`}>{notice.text}</p>
      <div className={`h-1 ${isError ? "bg-red-100" : "bg-navy/10"}`}>
        <div className={`admin-toast-bar h-full ${isError ? "bg-red-500" : "bg-yellow"}`} />
      </div>
    </div>
  );
}
