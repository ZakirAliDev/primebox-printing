"use client";

import { useState } from "react";
import {
  exportProductsCsvAction,
  importProductCsvAction,
  previewProductCsvAction,
} from "@/app/admin/actions";
import { AdminPageIntro } from "@/components/admin/AdminPageBar";
import { adminBox, adminGhost, adminMuted, adminPrimary } from "@/components/admin/ui";
import { PRODUCT_CSV_SAMPLE } from "@/lib/product-csv";

type PreviewRow = Awaited<ReturnType<typeof previewProductCsvAction>>["rows"][number];

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProductImportForm() {
  const [csv, setCsv] = useState("");
  const [filename, setFilename] = useState("");
  const [updateExisting, setUpdateExisting] = useState(true);
  const [downloadImages, setDownloadImages] = useState(true);
  const [busy, setBusy] = useState<"preview" | "import" | "export" | "">("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewProductCsvAction>> | null>(null);
  const [results, setResults] = useState<Awaited<ReturnType<typeof importProductCsvAction>> | null>(null);

  const loadFile = async (file: File) => {
    const text = await file.text();
    setFilename(file.name);
    setCsv(text);
    setPreview(null);
    setResults(null);
    setError("");
    setBusy("preview");
    try {
      setPreview(await previewProductCsvAction(text));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read that CSV.");
    } finally {
      setBusy("");
    }
  };

  const importRows = async () => {
    if (!csv) {
      return;
    }
    setBusy("import");
    setError("");
    try {
      setResults(await importProductCsvAction(csv, { updateExisting, downloadImages }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.");
    } finally {
      setBusy("");
    }
  };

  const counts = results
    ? {
        created: results.filter((row) => row.action === "created").length,
        updated: results.filter((row) => row.action === "updated").length,
        skipped: results.filter((row) => row.action === "skipped").length,
        error: results.filter((row) => row.action === "error").length,
      }
    : null;

  const previewRows: PreviewRow[] = preview?.rows ?? [];
  const ready = previewRows.filter((row) => !row.skip && (updateExisting || !row.exists)).length;

  return (
    <div className="space-y-4">
      <AdminPageIntro>
        Upload a CSV to create or update many products at once. WooCommerce product exports work if they include Name,
        SKU, Description, Categories, and Images.
      </AdminPageIntro>

      <div className={adminBox}>
        <div className="border-b border-navy/10 px-4 py-3">
          <h2 className="font-semibold text-navy">CSV file</h2>
          <p className={`mt-0.5 text-xs ${adminMuted}`}>
            Required: Name (or SKU). Optional: summary, body/description, image/images, categories. Existing products
            are matched by slug/SKU.
          </p>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className={adminGhost}>
              Choose CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled={Boolean(busy)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void loadFile(file);
                  }
                }}
              />
            </label>
            <span className={`text-sm ${adminMuted}`}>{filename || "No file chosen"}</span>
            {busy === "preview" ? <span className="text-sm text-navy">Reading…</span> : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={updateExisting}
              onChange={(event) => setUpdateExisting(event.target.checked)}
            />
            Update products that already exist (same slug/SKU)
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={downloadImages}
              onChange={(event) => setDownloadImages(event.target.checked)}
            />
            Download remote image URLs into this site
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminPrimary} disabled={!csv || Boolean(busy) || ready === 0} onClick={() => void importRows()}>
              {busy === "import" ? "Importing…" : `Import ${ready} product${ready === 1 ? "" : "s"}`}
            </button>
            <button
              type="button"
              className={adminGhost}
              onClick={() => downloadText("product-import-sample.csv", PRODUCT_CSV_SAMPLE)}
            >
              Download sample CSV
            </button>
            <button
              type="button"
              className={adminGhost}
              disabled={Boolean(busy)}
              onClick={() => {
                setBusy("export");
                void exportProductsCsvAction()
                  .then((text) => downloadText("products-export.csv", text))
                  .catch((caught: unknown) => {
                    setError(caught instanceof Error ? caught.message : "Export failed.");
                  })
                  .finally(() => setBusy(""));
              }}
            >
              {busy === "export" ? "Exporting…" : "Export current products"}
            </button>
          </div>
        </div>
      </div>

      {counts ? (
        <div className={adminBox}>
          <div className="px-4 py-3 text-sm text-navy">
            Imported: {counts.created} created, {counts.updated} updated, {counts.skipped} skipped
            {counts.error ? `, ${counts.error} errors` : ""}.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/[0.04] text-navy">
                <tr>
                  <th className="px-4 py-2">Row</th>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={`${row.line}-${row.slug}`} className="border-t border-navy/10">
                    <td className="px-4 py-2 text-navy/60">{row.line}</td>
                    <td className="px-4 py-2 text-navy">{row.name}</td>
                    <td className="px-4 py-2 text-navy/70">
                      {row.action}
                      {row.message ? ` — ${row.message}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {preview && !results ? (
        <div className={adminBox}>
          <div className="border-b border-navy/10 px-4 py-3">
            <h2 className="font-semibold text-navy">Preview</h2>
            <p className={`mt-0.5 text-xs ${adminMuted}`}>
              {previewRows.length} row{previewRows.length === 1 ? "" : "s"} in file.
              {preview.issues.length ? ` ${preview.issues.length} blank rows ignored.` : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/[0.04] text-navy">
                <tr>
                  <th className="px-4 py-2">Row</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Slug</th>
                  <th className="px-4 py-2">Categories</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => {
                  const action = row.skip
                    ? row.skip
                    : row.exists
                      ? updateExisting
                        ? "Update"
                        : "Skip (exists)"
                      : "Create";
                  return (
                    <tr key={`${row.line}-${row.slug}`} className="border-t border-navy/10">
                      <td className="px-4 py-2 text-navy/60">{row.line}</td>
                      <td className="px-4 py-2 text-navy">{row.name}</td>
                      <td className="px-4 py-2 text-navy/70">{row.slug}</td>
                      <td className="px-4 py-2 text-navy/70">
                        {row.categorySlugs.join(", ") || "—"}
                        {row.unknownCategories.length ? (
                          <span className="block text-red-700">Unknown: {row.unknownCategories.join(", ")}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 text-navy/70">{action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
