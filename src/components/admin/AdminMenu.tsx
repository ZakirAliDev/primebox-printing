"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PRODUCT_SECTIONS = ["new", "import", "categories", "category-page-settings", "tags", "attributes", "reviews", "page-settings"] as const;

const PRODUCT_SUBMENU = [
  { href: "/admin/products", label: "All Products", id: "all" },
  { href: "/admin/products/new", label: "Add new product", id: "new" },
  { href: "/admin/products/import", label: "Import products", id: "import" },
  { href: "/admin/products/categories", label: "Categories", id: "categories" },
  { href: "/admin/products/categories/page-settings", label: "Category page settings", id: "category-page-settings" },
  { href: "/admin/products/tags", label: "Tags", id: "tags" },
  { href: "/admin/products/attributes", label: "Attributes", id: "attributes" },
  { href: "/admin/products/reviews", label: "Reviews", id: "reviews" },
  { href: "/admin/products/page-settings", label: "Product page settings", id: "page-settings" },
] as const;

function isProductsPath(pathname: string) {
  return pathname === "/admin/products" || pathname.startsWith("/admin/products/");
}

function isSubCurrent(pathname: string, id: (typeof PRODUCT_SUBMENU)[number]["id"]) {
  if (id === "all") {
    if (pathname === "/admin/products") {
      return true;
    }
    if (!pathname.startsWith("/admin/products/")) {
      return false;
    }
    const first = pathname.slice("/admin/products/".length).split("/")[0];
    return !PRODUCT_SECTIONS.includes(first as (typeof PRODUCT_SECTIONS)[number]);
  }
  if (id === "new") {
    return pathname === "/admin/products/new";
  }
  if (id === "category-page-settings") {
    return pathname === "/admin/products/categories/page-settings";
  }
  if (id === "categories") {
    if (pathname === "/admin/products/categories/page-settings") {
      return false;
    }
    return pathname === "/admin/products/categories" || pathname.startsWith("/admin/products/categories/");
  }
  return pathname === `/admin/products/${id}` || pathname.startsWith(`/admin/products/${id}/`);
}

function isTouchUi() {
  return window.matchMedia("(hover: none)").matches;
}

function navItemClass(active: boolean) {
  return `block border-l-[3px] px-4 py-2.5 ${
    active
      ? "border-yellow bg-white/10 font-semibold text-white"
      : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
  }`;
}

export function AdminMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suppressHover = useRef(false);
  const skipPathClose = useRef(true);

  const closeMenu = () => {
    setOpen(false);
    suppressHover.current = true;
  };

  useEffect(() => {
    if (skipPathClose.current) {
      skipPathClose.current = false;
      return;
    }
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const dashboardActive = pathname === "/admin";
  const productsActive = isProductsPath(pathname);
  const templatesActive = pathname === "/admin/templates" || pathname.startsWith("/admin/templates/");
  const settingsActive = pathname === "/admin/settings" || pathname.startsWith("/admin/settings/");

  return (
    <nav className="flex-1 overflow-visible py-2">
      <Link href="/admin" className={navItemClass(dashboardActive)}>
        Dashboard
      </Link>
      <div
        ref={wrapRef}
        className="relative"
        onMouseEnter={() => {
          if (!suppressHover.current && !isTouchUi()) {
            setOpen(true);
          }
        }}
        onMouseLeave={() => {
          suppressHover.current = false;
          setOpen(false);
        }}
      >
        <Link
          href="/admin/products"
          aria-expanded={open}
          aria-haspopup="menu"
          className={navItemClass(productsActive)}
          onClick={(event) => {
            if (isTouchUi()) {
              event.preventDefault();
              suppressHover.current = false;
              setOpen((current) => !current);
              return;
            }
            closeMenu();
          }}
        >
          Products
        </Link>
        <ul
          role="menu"
          className={`absolute top-0 left-[calc(100%-1px)] z-[70] min-w-[200px] border border-navy/20 bg-navy py-2 shadow-lg ${
            open ? "visible" : "invisible pointer-events-none"
          }`}
        >
          <li className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-yellow">
            Products
          </li>
          {PRODUCT_SUBMENU.map((item) => {
            const current = isSubCurrent(pathname, item.id);
            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  className={`block px-4 py-2 ${
                    current ? "font-semibold text-yellow" : "text-white/80 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <Link href="/admin/templates" className={navItemClass(templatesActive)}>
        Templates
      </Link>
      <Link href="/admin/settings" className={navItemClass(settingsActive)}>
        Site settings
      </Link>
    </nav>
  );
}
