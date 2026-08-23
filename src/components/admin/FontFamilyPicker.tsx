"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { adminField } from "@/components/admin/ui";
import { GoogleFontStylesheet } from "@/components/GoogleFontStylesheet";
import {
  canAddCustomFont,
  filterFontOptions,
  fontFamilyCss,
  fontOptionLabel,
  sanitizeFontFamily,
  type FontOption,
  type FontOptionGroup,
} from "@/lib/google-fonts";

const GROUP_LABEL: Record<FontOptionGroup, string> = {
  site: "Site",
  custom: "Added",
  google: "Google",
};

export function FontFamilyPicker({
  value,
  extras = [],
  disabled,
  compact,
  onChange,
  onAdd,
}: {
  value: string;
  extras?: string[];
  disabled?: boolean;
  compact?: boolean;
  onChange: (family: string) => void;
  onAdd?: (family: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedLabel = fontOptionLabel(value) || "";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedLabel);
  const [typed, setTyped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);

  const options = useMemo(
    () => filterFontOptions(open && typed ? query : "", extras),
    [extras, open, query, typed],
  );
  const addName = sanitizeFontFamily(query);
  const showAdd = open && typed && canAddCustomFont(query, extras);
  const items = showAdd
    ? [...options, { id: addName, label: `Add “${addName}”`, group: "custom" as const, add: true }]
    : options;

  const previewFamilies = useMemo(
    () => [value, ...options.filter((option) => option.group === "google").slice(0, 24).map((option) => option.id)],
    [options, value],
  );

  useEffect(() => {
    if (!open) {
      setQuery(selectedLabel);
      setTyped(false);
    }
  }, [open, selectedLabel]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setMenuBox({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 220) });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open, typed]);

  const select = (option: FontOption & { add?: boolean }) => {
    if (option.add) {
      onAdd?.(option.id);
    }
    onChange(option.id);
    setQuery(option.add ? option.id : option.label);
    setTyped(false);
    setOpen(false);
  };

  const openList = () => {
    if (disabled || open) {
      return;
    }
    setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openList();
      setActiveIndex((index) => Math.min(items.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (open && item) {
        select(item);
      } else {
        openList();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  let lastGroup: FontOptionGroup | "" = "";

  return (
    <div ref={rootRef} className="relative h-[38px] max-h-[38px] w-full">
      <GoogleFontStylesheet families={previewFamilies} />
      <div
        className={`${adminField} flex h-[38px] max-h-[38px] items-center gap-1 px-2 py-0 ${disabled ? "opacity-60" : ""} ${
          open ? "border-navy" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          value={query}
          placeholder="Search fonts"
          autoComplete="off"
          spellCheck={false}
          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-none text-navy outline-none"
          style={{ fontFamily: typed ? undefined : fontFamilyCss(value) }}
          onFocus={() => {
            openList();
            inputRef.current?.select();
          }}
          onChange={(event) => {
            setTyped(true);
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? "Close font list" : "Open font list"}
          className="flex h-full shrink-0 items-center px-1 text-navy/40"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (disabled) {
              return;
            }
            if (open) {
              setOpen(false);
              return;
            }
            inputRef.current?.focus();
            inputRef.current?.select();
            setOpen(true);
          }}
        >
          ▾
        </button>
      </div>
      {open && menuBox
        ? createPortal(
            <div
              ref={menuRef}
              className="overflow-hidden rounded border border-navy/20 bg-white shadow-lg"
              style={{ position: "fixed", top: menuBox.top, left: menuBox.left, width: menuBox.width, zIndex: 80 }}
            >
              <ul role="listbox" className="max-h-56 overflow-auto py-1">
                {items.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-navy/55">No matching fonts</li>
                ) : (
                  items.map((item, index) => {
                    const heading = item.group !== lastGroup ? GROUP_LABEL[item.group] : null;
                    lastGroup = item.group;
                    return (
                      <li key={`${item.group}-${item.id}-${item.add ? "add" : "opt"}`}>
                        {heading ? (
                          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wide text-navy/45 uppercase">
                            {heading}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          role="option"
                          aria-selected={item.id === value && !item.add}
                          className={`flex w-full px-3 py-1.5 text-left text-sm ${
                            index === activeIndex ? "bg-navy/[0.08]" : "hover:bg-navy/[0.04]"
                          }`}
                          style={item.add ? undefined : { fontFamily: fontFamilyCss(item.id) }}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => select(item)}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
