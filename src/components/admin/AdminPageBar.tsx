"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { previewCategoryAction, previewPackageAction } from "@/app/admin/actions";
import { adminGhostOnDark, adminPrimary } from "@/components/admin/ui";

type BarSlots = {
  intro: HTMLElement | null;
  actions: HTMLElement | null;
};

const AdminPageBarContext = createContext<BarSlots>({ intro: null, actions: null });
const AdminPageBarSettersContext = createContext<{
  setIntro: (node: HTMLElement | null) => void;
  setActions: (node: HTMLElement | null) => void;
} | null>(null);

export function AdminPageBarProvider({ children }: { children: ReactNode }) {
  const [intro, setIntro] = useState<HTMLElement | null>(null);
  const [actions, setActions] = useState<HTMLElement | null>(null);
  const slots = useMemo(() => ({ intro, actions }), [intro, actions]);
  const setters = useMemo(() => ({ setIntro, setActions }), []);

  return (
    <AdminPageBarSettersContext.Provider value={setters}>
      <AdminPageBarContext.Provider value={slots}>{children}</AdminPageBarContext.Provider>
    </AdminPageBarSettersContext.Provider>
  );
}

function titleForPath(pathname: string) {
  if (pathname === "/admin") {
    return "Dashboard";
  }
  if (pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")) {
    return "Site settings";
  }
  if (pathname === "/admin/templates") {
    return "Templates";
  }
  if (pathname === "/admin/templates/new") {
    return "Add New Template";
  }
  if (pathname.startsWith("/admin/templates/")) {
    return "Edit Template";
  }
  if (pathname === "/admin/products") {
    return "Products";
  }
  if (pathname === "/admin/products/new") {
    return "Add New Product";
  }
  if (pathname === "/admin/products/import") {
    return "Import products";
  }
  if (pathname === "/admin/products/page-settings" || pathname.startsWith("/admin/products/page-settings/")) {
    return "Product page settings";
  }
  if (pathname === "/admin/products/reviews" || pathname.startsWith("/admin/products/reviews/")) {
    return "Reviews";
  }
  if (pathname === "/admin/products/categories") {
    return "Categories";
  }
  if (pathname === "/admin/products/categories/page-settings") {
    return "Category page settings";
  }
  if (pathname === "/admin/products/categories/new") {
    return "Add New Category";
  }
  if (pathname.startsWith("/admin/products/categories/")) {
    return "Edit Category";
  }
  if (pathname === "/admin/products/tags") {
    return "Tags";
  }
  if (pathname === "/admin/products/tags/new") {
    return "Add New Tag";
  }
  if (pathname.startsWith("/admin/products/tags/")) {
    return "Edit Tag";
  }
  if (pathname === "/admin/products/attributes") {
    return "Attributes";
  }
  if (pathname === "/admin/products/attributes/new") {
    return "Add New Attribute";
  }
  if (pathname.startsWith("/admin/products/attributes/")) {
    return "Edit Attribute";
  }
  if (pathname.startsWith("/admin/products/")) {
    return "Edit Product";
  }
  return "Admin";
}

export function AdminPageBar() {
  const pathname = usePathname();
  const setters = useContext(AdminPageBarSettersContext);
  const title = titleForPath(pathname);

  if (!setters) {
    throw new Error("AdminPageBar requires AdminPageBarProvider");
  }

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-navy px-5 py-3.5 shadow-sm">
      <div className="min-w-0 flex-1">
        <h1 className="text-[15px] font-semibold tracking-wide text-white">{title}</h1>
        <div ref={setters.setIntro} className="mt-1 max-w-3xl text-sm text-white/70 empty:mt-0 empty:hidden" />
      </div>
      <div ref={setters.setActions} className="flex shrink-0 flex-wrap items-center gap-3 empty:hidden" />
    </header>
  );
}

export function AdminPageIntro({ children }: { children: ReactNode }) {
  const { intro } = useContext(AdminPageBarContext);
  if (!intro) {
    return null;
  }
  return createPortal(children, intro);
}

export function AdminPageActions({ children }: { children: ReactNode }) {
  const { actions } = useContext(AdminPageBarContext);
  if (!actions) {
    return null;
  }
  return createPortal(children, actions);
}

function AdminPreviewButton({
  formId,
  kind,
}: {
  formId: string;
  kind: "package" | "category";
}) {
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const form = document.getElementById(formId);
    const input =
      form?.querySelector<HTMLInputElement>('input[name="slug"]') ??
      document.querySelector<HTMLInputElement>(`input[form="${formId}"][name="slug"]`);
    if (!input) {
      return;
    }
    const sync = () => setSlug(input.value.trim());
    sync();
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    return () => {
      input.removeEventListener("input", sync);
      input.removeEventListener("change", sync);
    };
  }, [formId]);

  const runPreview = async () => {
    if (busy) {
      return;
    }
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      setError("Form not found.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      form.dispatchEvent(new Event("admin:sync-editors", { bubbles: true }));
      document.dispatchEvent(new Event("admin:sync-editors"));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const formData = new FormData(form);
      const result =
        kind === "package" ? await previewPackageAction(formData) : await previewCategoryAction(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      setError("Could not create preview.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={!slug || busy}
        className={adminGhostOnDark}
        title={!slug ? "Enter a title or slug to preview" : "Preview unsaved changes"}
        onClick={() => void runPreview()}
      >
        {busy ? "Preparing…" : "Preview"}
      </button>
      {error ? <span className="max-w-[14rem] text-right text-xs text-red-300">{error}</span> : null}
    </span>
  );
}

export function AdminPublishActions({
  isNew,
  formId,
  submitLabel,
  trash,
  previewKind,
}: {
  isNew: boolean;
  formId: string;
  submitLabel?: string;
  trash?: ReactNode;
  /** Enables WordPress-style unsaved preview for products or categories. */
  previewKind?: "package" | "category";
}) {
  const publish = () => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    document.dispatchEvent(new Event("admin:sync-editors"));
    form.dispatchEvent(new Event("admin:sync-editors", { bubbles: true }));
    // Let TinyMCE / FAQ listeners flush into inputs before the server action reads FormData.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof form.requestSubmit === "function") {
          form.requestSubmit();
        } else {
          form.submit();
        }
      });
    });
  };

  return (
    <AdminPageActions>
      <p className="text-sm text-white/75">Status: {isNew ? "Draft" : "Published"}</p>
      {trash}
      {previewKind ? <AdminPreviewButton formId={formId} kind={previewKind} /> : null}
      <button type="button" className={adminPrimary} onClick={publish}>
        {submitLabel ?? (isNew ? "Publish" : "Update")}
      </button>
    </AdminPageActions>
  );
}
