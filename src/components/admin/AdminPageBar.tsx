"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { adminPrimary } from "@/components/admin/ui";

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

export function AdminPublishActions({
  isNew,
  formId,
  submitLabel,
  trash,
}: {
  isNew: boolean;
  formId: string;
  submitLabel?: string;
  trash?: ReactNode;
}) {
  return (
    <AdminPageActions>
      <p className="text-sm text-white/75">Status: {isNew ? "Draft" : "Published"}</p>
      {trash}
      <button form={formId} type="submit" className={adminPrimary}>
        {submitLabel ?? (isNew ? "Publish" : "Update")}
      </button>
    </AdminPageActions>
  );
}
